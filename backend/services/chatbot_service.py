import time
from config.config import Config

class ChatbotService:
    def __init__(self):
        self.sentence_model = None
        self.qa_pipeline = None
        self.is_loaded = False

    def load_models(self):
        """Lazy load SentenceTransformers and Hugging Face QA models."""
        if not self.is_loaded:
            print("Loading Chatbot models (SentenceTransformers & DistilBERT QA)...")
            from sentence_transformers import SentenceTransformer
            from transformers import pipeline
            import torch
            
            device = 0 if torch.cuda.is_available() else -1
            print(f"Chatbot service models are loading on device: {device}")
            
            # Load Sentence Transformers for semantic question embedding
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Load squad QA extractor (efficient model)
            try:
                self.qa_pipeline = pipeline(
                    "question-answering", 
                    model="distilbert-base-cased-distilled-squad",
                    device=device
                )
            except Exception as e:
                print(f"Failed to load QA pipeline: {e}. Fallback to direct context match will be used.")
                self.qa_pipeline = None
                
            self.is_loaded = True
            print("Chatbot service models loaded successfully.")

    def _cosine_similarity(self, vec_a, vec_b):
        """Computes dot product of normalized L2 vectors (equivalent to cosine similarity)."""
        return sum(x * y for x, y in zip(vec_a, vec_b))

    def _extract_supporting_quote(self, answer, context_chunks):
        """Finds the sentence in the context chunks that contains the extracted answer."""
        if not answer or not answer.strip():
            return ""
        
        import re
        # Split chunks into sentences
        sentences = []
        for chunk in context_chunks:
            try:
                import nltk
                chunk_sents = nltk.tokenize.sent_tokenize(chunk)
            except Exception:
                chunk_sents = re.split(r'(?<=[.!?])\s+', chunk)
            sentences.extend([s.strip() for s in chunk_sents if s.strip()])
            
        ans_lower = answer.lower()
        
        # 1. Look for direct sentence containing the answer span
        for s in sentences:
            if ans_lower in s.lower():
                return s
                
        # 2. Token overlap fallback if direct substring not found (e.g. slight tokenization mismatch)
        best_sent = ""
        max_overlap = 0
        ans_words = set(re.findall(r'\b\w{3,}\b', ans_lower))
        for s in sentences:
            s_words = set(re.findall(r'\b\w{3,}\b', s.lower()))
            overlap = len(ans_words.intersection(s_words))
            if overlap > max_overlap:
                max_overlap = overlap
                best_sent = s
                
        if best_sent:
            return best_sent
            
        return context_chunks[0] if context_chunks else ""

    def answer_question(self, question, transcript_record, history=None):
        """Search transcript chunks semantically (with lexical Jaccard hybrid search and memory) and extract answer."""
        if not question or not question.strip():
            return {"answer": "Please type a valid question.", "quote": ""}
            
        chunks = transcript_record.get("chunks", [])
        if not chunks:
            # Fallback if chunks are missing (e.g. old record or empty transcript)
            transcript_text = transcript_record.get("transcript", "")
            if not transcript_text:
                return {"answer": "The transcript is empty. I cannot answer any questions.", "quote": ""}
            
            # Create chunks on the fly
            from services.analytics_service import analytics_service
            chunks = analytics_service.get_chunks_with_embeddings(transcript_text)
            
        if not chunks:
            return {"answer": "No readable context found in the transcript.", "quote": ""}

        # Load models lazily
        self.load_models()
        
        # 1. Conversational Memory: Contextualize the search query if history is provided
        search_query = question
        if history and isinstance(history, list):
            # Extract last user and bot turn
            user_turns = [m for m in history if m.get("sender") == "user"]
            bot_turns = [m for m in history if m.get("sender") == "bot"]
            if user_turns and bot_turns:
                last_q = user_turns[-1].get("text", "")
                last_a = bot_turns[-1].get("text", "")
                if last_q and last_a:
                    search_query = f"Previous Question: {last_q} | Previous Answer: {last_a} | Current Question: {question}"

        # 2. Embed user question/search query
        import time
        start_time = time.time()
        print(f"[RAG DEBUG] Embedding search query: '{search_query}'...")
        query_embedding = self.sentence_model.encode(search_query).tolist()
        embed_elapsed = (time.time() - start_time) * 1000
        
        # Define stopwords list locally for Jaccard
        STOPWORDS = {
            'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
            'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
            'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
            'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
            'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
            'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
            'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
            'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
            'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'should', 'now', 'also', 'would', 'get', 'like'
        }
        
        # 3. Hybrid Lexical + Semantic Search
        import re
        scored_chunks = []
        for idx, chunk in enumerate(chunks):
            chunk_embedding = chunk.get("embedding")
            if not chunk_embedding:
                continue
            
            # Semantic Score (Cosine Similarity)
            sem_score = self._cosine_similarity(query_embedding, chunk_embedding)
            
            # Lexical Score (Jaccard Overlap)
            chunk_text = chunk.get("text", "")
            q_words = set(re.findall(r'\b\w{3,}\b', question.lower())) - STOPWORDS
            c_words = set(re.findall(r'\b\w{3,}\b', chunk_text.lower())) - STOPWORDS
            lex_score = 0.0
            if q_words:
                lex_score = len(q_words.intersection(c_words)) / len(q_words.union(c_words)) if q_words.union(c_words) else 0.0
                
            # Combine scores (70% Semantic + 30% Lexical)
            hybrid_score = 0.7 * sem_score + 0.3 * lex_score
            scored_chunks.append({
                "index": idx,
                "text": chunk_text,
                "sem_score": sem_score,
                "lex_score": lex_score,
                "score": hybrid_score
            })
            
        if not scored_chunks:
            return {"answer": "Could not perform search on transcript.", "quote": ""}
            
        # Sort chunks by hybrid score descending
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        
        # Console Debugging: Log top similarity scores
        print(f"[RAG DEBUG] Chunk count in transcript: {len(chunks)}")
        print(f"[RAG DEBUG] Embedding creation elapsed: {embed_elapsed:.2f}ms")
        print("[RAG DEBUG] Top chunk matches and similarities:")
        for i, c in enumerate(scored_chunks[:5]):
            print(f"  #{i+1}: Chunk Index {c['index']} | Hybrid: {c['score']:.4f} (Sem: {c['sem_score']:.4f}, Lex: {c['lex_score']:.4f}) | Text: '{c['text'][:80]}...'")
            
        # Retrieve top 2 chunks as context (more precise context is better for DistilBERT)
        top_chunks = scored_chunks[:2]
        retrieved_texts = [c["text"] for c in top_chunks]
        context = " ".join(retrieved_texts)
        print(f"[RAG DEBUG] Retrieved top chunks for context: {retrieved_texts}")
        
        # 4. Confidence Threshold: If the highest similarity score is too low, return clean grounded refusal
        # Retrieval similarity score threshold = 0.22
        if scored_chunks[0]["score"] < 0.22:
            print("[RAG DEBUG] Highest chunk score below threshold (0.22). Refusing query to ground answer only in transcript.")
            return {
                "answer": "I'm sorry, but I couldn't find any relevant information in the transcript to answer your question. Could you please ask about something discussed in the conversation?",
                "quote": ""
            }
            
        # 5. Extract Answer via QA pipeline
        answer_text = ""
        qa_score = 0.0
        selected_chunk_text = ""
        
        if self.qa_pipeline is not None:
            try:
                print("[RAG DEBUG] Running context through QA extraction model...")
                qa_res = self.qa_pipeline(question=question, context=context)
                answer_text = qa_res.get("answer", "").strip()
                qa_score = qa_res.get("score", 0.0)
                print(f"[RAG DEBUG] QA pipeline returned: '{answer_text}' (Score: {qa_score:.4f})")
            except Exception as e:
                print(f"[RAG DEBUG] QA pipeline execution failed: {e}. Falling back.")
                
        # Confidence threshold on QA span extraction (0.02)
        # If QA returns high confidence answer, extract the matching sentence as the quote.
        if answer_text and qa_score >= 0.02:
            quote = self._extract_supporting_quote(answer_text, retrieved_texts)
            # Find which chunk the quote came from for debugging
            for c in top_chunks:
                if quote in c["text"]:
                    selected_chunk_text = c["text"]
                    break
            if not selected_chunk_text:
                selected_chunk_text = top_chunks[0]["text"]
                
            print(f"[RAG DEBUG] Selected answer chunk: '{selected_chunk_text[:100]}...'")
            return {
                "answer": answer_text,
                "quote": quote
            }
            
        # 6. Fallback: If QA pipeline failed or had low confidence, return the top chunk text as answer
        best_chunk = top_chunks[0]["text"]
        print(f"[RAG DEBUG] Low QA confidence. Falling back to returning top chunk. Selected answer chunk: '{best_chunk[:100]}...'")
        return {
            "answer": f"According to the transcript: \"{best_chunk}\"",
            "quote": best_chunk
        }

# Singleton instance
chatbot_service = ChatbotService()
