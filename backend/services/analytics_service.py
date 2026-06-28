import re
import collections
from config.config import Config

# Standard English stopwords
DEFAULT_STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
    'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
    'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
    'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
    'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
    "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
    'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
    'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
    'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't", "also", "would", "get", "like"
}

class AnalyticsService:
    def __init__(self):
        self.sentiment_pipe = None
        self.summarizer_pipe = None
        self.keybert_model = None
        self.sentence_model = None
        self.is_loaded = False
        
        # Load NLTK resources
        try:
            import nltk
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            from nltk.corpus import stopwords
            self.stopwords = set(stopwords.words('english')).union(DEFAULT_STOPWORDS)
        except Exception as e:
            print(f"NLTK setup skipped: {e}. Using static stopwords list.")
            self.stopwords = DEFAULT_STOPWORDS

    def load_nlp_models(self):
        """Loads Hugging Face Pipelines & KeyBERT lazily on the first analysis call."""
        if not self.is_loaded:
            print("Loading Hugging Face pipelines & KeyBERT models (lazily)...")
            from transformers import pipeline
            from keybert import KeyBERT
            import torch
            
            device = 0 if torch.cuda.is_available() else -1
            print(f"NLP Pipelines are loading on device index: {device}")
            
            # 1. Sentiment analysis pipeline
            self.sentiment_pipe = pipeline("sentiment-analysis", device=device)
            
            # 2. BART Summarization pipeline (lightweight model)
            self.summarizer_pipe = pipeline(
                "summarization",
                model="sshleifer/distilbart-cnn-12-6",
                device=device
            )
            
            # 3. KeyBERT extractor
            self.keybert_model = KeyBERT()
            self.is_loaded = True
            print("Hugging Face models and KeyBERT loaded successfully.")

    def load_sentence_model(self):
        """Loads SentenceTransformers model lazily for chunk embedding generation."""
        if self.sentence_model is None:
            print("Loading SentenceTransformers model (all-MiniLM-L6-v2) lazily...")
            from sentence_transformers import SentenceTransformer
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("SentenceTransformers initialized successfully.")

    def chunk_text_semantic(self, text):
        """Splits transcript into chunks based on sentence embedding similarity."""
        try:
            import nltk
            sentences = nltk.tokenize.sent_tokenize(text)
        except Exception:
            # Fallback sentence splitter in case NLTK tokenizer fails
            sentences = re.split(r'(?<=[.!?])\s+', text)
            
        sentences = [s.strip() for s in sentences if s.strip()]
        if not sentences:
            return []
            
        if len(sentences) <= 1:
            return sentences

        self.load_sentence_model()
        # Get embeddings for each individual sentence
        sentence_embeddings = self.sentence_model.encode(sentences)
        
        chunks = []
        current_chunk_sentences = [sentences[0]]
        
        for idx in range(1, len(sentences)):
            # Cosine similarity between current sentence and previous sentence
            emb_prev = sentence_embeddings[idx-1]
            emb_curr = sentence_embeddings[idx]
            
            # Simple cosine similarity dot product (normalized vectors)
            dot_product = sum(x * y for x, y in zip(emb_prev, emb_curr))
            norm_prev = sum(x * x for x in emb_prev) ** 0.5
            norm_curr = sum(x * x for x in emb_curr) ** 0.5
            similarity = dot_product / (norm_prev * norm_curr + 1e-9)
            
            # Boundary decision: split if similarity is low (< 0.45) OR if the current chunk is getting too long (>= 4 sentences)
            if similarity < 0.45 or len(current_chunk_sentences) >= 4:
                chunks.append(" ".join(current_chunk_sentences))
                current_chunk_sentences = [sentences[idx]]
            else:
                current_chunk_sentences.append(sentences[idx])
                
        if current_chunk_sentences:
            chunks.append(" ".join(current_chunk_sentences))
            
        return chunks

    def chunk_text(self, text, chunk_size=3, overlap=1):
        """Splits transcript into window segments (preserved for backward compatibility if needed)."""
        return self.chunk_text_semantic(text)

    def get_chunks_with_embeddings(self, text):
        """Precomputes semantic text chunks and their embeddings for semantic chatbot Q&A."""
        chunks = self.chunk_text_semantic(text)
        if not chunks:
            return []
            
        self.load_sentence_model()
        print(f"[RAG DEBUG] Generating embeddings for {len(chunks)} semantic chunks...")
        embeddings = self.sentence_model.encode(chunks)
        
        # Package chunks with list-serialized embeddings
        chunks_with_embeddings = []
        for text_chunk, emb in zip(chunks, embeddings):
            chunks_with_embeddings.append({
                "text": text_chunk,
                "embedding": emb.tolist()  # Convert numpy float32 to float lists
            })
            
        return chunks_with_embeddings

    def run_sentiment_analysis(self, text):
        """Performs context-aware sentiment analysis using Sentence-Transformers zero-shot matching."""
        if not text or not text.strip():
            return {"label": "NEUTRAL", "score": 1.0}
            
        self.load_sentence_model()
        
        # Split text into sentences for representation
        try:
            import nltk
            sentences = nltk.tokenize.sent_tokenize(text)
        except Exception:
            sentences = re.split(r'(?<=[.!?])\s+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return {"label": "NEUTRAL", "score": 1.0}
            
        # 1. Embed the transcript.
        sentence_embs = self.sentence_model.encode(sentences)
        import numpy as np
        transcript_emb = np.mean(sentence_embs, axis=0)
        
        # 2. Define semantic anchors for each of the 6 classes
        anchors = {
            "POSITIVE": [
                "This conversation is positive, encouraging, happy, supportive, and optimistic.",
                "The speakers are expressing satisfaction, success, progress, and friendly agreement."
            ],
            "NEGATIVE": [
                "This conversation is negative, disappointed, frustrated, critical, or complaining.",
                "The speakers are expressing problems, difficulties, failure, concern, or conflict."
            ],
            "NEUTRAL": [
                "This conversation is neutral, matter-of-fact, plain, and conversational.",
                "The speakers are talking normally, exchanging standard greetings or simple chit-chat without strong emotions."
            ],
            "INFORMATIVE": [
                "This conversation is highly informative, sharing knowledge, explaining concepts, and teaching.",
                "The speakers are providing factual explanations, detailed guidance, educational tutorials, or project updates."
            ],
            "ANALYTICAL": [
                "This conversation is analytical, solving problems, evaluating metrics, and brainstorming.",
                "The speakers are reviewing performance data, diagnosing issues, analyzing technical options, or logical planning."
            ],
            "MIXED": [
                "This conversation has mixed emotions, combining positive highlights with negative feedback.",
                "The speakers express a balance of positive progress and negative setbacks, or show shifting opinions."
            ]
        }
        
        # 3. Embed anchors and calculate cosine similarity
        class_scores = {}
        for label, descriptions in anchors.items():
            desc_embs = self.sentence_model.encode(descriptions)
            anchor_emb = np.mean(desc_embs, axis=0)
            
            # Compute cosine similarity
            dot = np.dot(transcript_emb, anchor_emb)
            norm_transcript = np.linalg.norm(transcript_emb)
            norm_anchor = np.linalg.norm(anchor_emb)
            similarity = dot / (norm_transcript * norm_anchor + 1e-9)
            class_scores[label] = float(similarity)
            
        # 4. Softmax with low temperature scaling to calibrate probabilities
        temp = 0.05
        max_score = max(class_scores.values())
        exp_scores = {k: np.exp((v - max_score) / temp) for k, v in class_scores.items()}
        sum_exp = sum(exp_scores.values())
        probabilities = {k: float(v / sum_exp) for k, v in exp_scores.items()}
        
        best_label = max(probabilities, key=probabilities.get)
        confidence = probabilities[best_label]
        
        print(f"[SENTIMENT DEBUG] Class similarities: {class_scores}")
        print(f"[SENTIMENT DEBUG] Softmax probabilities: {probabilities}")
        print(f"[SENTIMENT DEBUG] Selected: {best_label} ({confidence:.4f})")
        
        return {"label": best_label, "score": confidence}

    def run_keyword_extraction(self, text):
        """Extracts keywords using KeyBERT model."""
        self.load_nlp_models()
        keywords = self.keybert_model.extract_keywords(
            text, 
            keyphrase_ngram_range=(1, 2), 
            stop_words='english', 
            top_n=7
        )
        return [{"text": kw[0], "score": float(kw[1])} for kw in keywords]

    def run_summarization(self, text):
        """Summarizes text using transformers summarization pipeline with segment-based merging."""
        if not text or not text.strip():
            return ""
            
        word_count = len(text.split())
        if word_count < 30:
            return text
            
        self.load_nlp_models()
        
        # If the text is short, summarize in a single pass
        if len(text) <= 2500:
            max_len = min(150, max(30, int(word_count * 0.4)))
            min_len = min(30, int(max_len * 0.5))
            summary_list = self.summarizer_pipe(text, max_length=max_len, min_length=min_len, do_sample=False)
            return summary_list[0]['summary_text'].strip()
            
        # For longer transcripts, split into sentence-bounded segments of ~2000 chars
        try:
            import nltk
            sentences = nltk.tokenize.sent_tokenize(text)
        except Exception:
            sentences = re.split(r'(?<=[.!?])\s+', text)
            
        segments = []
        current_segment = []
        current_len = 0
        
        for s in sentences:
            s_len = len(s)
            if current_len + s_len > 2000 and current_segment:
                segments.append(" ".join(current_segment))
                current_segment = [s]
                current_len = s_len
            else:
                current_segment.append(s)
                current_len += s_len
        if current_segment:
            segments.append(" ".join(current_segment))
            
        # Summarize each segment
        summaries = []
        for idx, seg in enumerate(segments):
            seg_word_count = len(seg.split())
            if seg_word_count < 15:
                continue
            max_len = min(120, max(30, int(seg_word_count * 0.4)))
            min_len = min(25, int(seg_word_count * 0.2))
            try:
                summary_list = self.summarizer_pipe(seg, max_length=max_len, min_length=min_len, do_sample=False)
                summaries.append(summary_list[0]['summary_text'].strip())
            except Exception as e:
                print(f"Error summarizing segment {idx}: {e}")
                # Fallback: just append first 2 sentences of segment
                summaries.append(" ".join(seg.split(".")[:2]))
                
        # Join summaries into a coherent paragraph sequence
        combined_summary = "\n\n".join(summaries)
        return combined_summary

    def get_word_frequency(self, text):
        """Calculates the frequency of top 10 non-stopwords."""
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        filtered_words = [w for w in words if w not in self.stopwords]
        counter = collections.Counter(filtered_words)
        return [{"word": word, "count": count} for word, count in counter.most_common(10)]

    def analyze(self, text):
        """Run all real NLP pipelines on the given text."""
        if not text or not text.strip():
            return {
                "sentiment": {"label": "NEUTRAL", "score": 0.5},
                "keywords": [],
                "summary": "No text provided for analysis.",
                "word_frequency": [],
                "word_count": 0,
                "reading_time": 0,
                "chunks": []
            }
            
        word_count = len(text.split())
        reading_time_seconds = int((word_count / 150) * 60)
        
        # Execute AI Pipelines
        sentiment = self.run_sentiment_analysis(text)
        keywords = self.run_keyword_extraction(text)
        summary = self.run_summarization(text)
        word_freq = self.get_word_frequency(text)
        
        # Generate chunks & vector embeddings
        chunks = self.get_chunks_with_embeddings(text)
        
        return {
            "sentiment": sentiment,
            "keywords": keywords,
            "summary": summary,
            "word_frequency": word_freq,
            "word_count": word_count,
            "reading_time": reading_time_seconds,
            "chunks": chunks
        }

# Singleton instance
analytics_service = AnalyticsService()
