import { useState, useEffect, useCallback, useMemo } from 'react'; // Import useMemo
import Sentiment from 'sentiment';
// Note: Topic modeling logic might need more robust libraries for production
// e.g., using server-side processing or WebAssembly-based libraries.

// Helper functions (keep outside or memoize if needed, but they seem pure)
const cleanWord = (word) => word.toLowerCase().replace(/[.,;:!?()[\]{}'"]/g, '');
const stopWords = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'be', 'this', 'that', 'with', 'from', 'by', 'was', 'were', 'has', 'have', 'had', 'it', 'as', 'not', 'or', 'but']);
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function countItems(arr) {
  return arr.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

function sortEntries(obj) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}


const useTextAnalysis = (data) => {
  const [wordFrequencyData, setWordFrequencyData] = useState([]);
  const [sentimentData, setSentimentData] = useState({ items: [], overall: {} });
  const [relationshipData, setRelationshipData] = useState({ nodes: [], links: [] });
  const [concordanceData, setConcordanceData] = useState([]);
  const [ttrData, setTtrData] = useState({ ttr: 0, uniqueWords: 0, totalWords: 0 });
  const [topicModelData, setTopicModelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the combined text to avoid recalculating it multiple times
  const allText = useMemo(() => {
    if (!data || data.length === 0) return '';
    return data.map(item => item.processingResult || item.content || '').join(' ');
  }, [data]);

  // --- Processing Functions (Return results, don't set state) ---

  const calculateWordFrequency = useCallback((textData) => {
    const allText = textData
      .map(item => item.processingResult || item.content || '')
      .join(' ')
      .toLowerCase();

    const words = allText
      .split(/\s+/)
      .map(cleanWord)
      .filter(word => word.length > 2 && /^[a-z]+$/i.test(word) && !stopWords.has(word));

    const frequency = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const sortedWords = Object.entries(frequency)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50); // Top 50

    return sortedWords; // Return the result
  }, [stopWords]); // Dependency is stable

  const calculateSentimentAnalysis = useCallback((textData) => {
    const sentimentAnalyzer = new Sentiment();
    const sentiments = textData.map(item => {
      const text = item.processingResult || item.content || '';
      const date = item.timestamp ? new Date(item.timestamp) : new Date();
      const result = sentimentAnalyzer.analyze(text);
      const { score, comparative, words, positive, negative } = result;

      return {
        id: item.id, // Include ID for potential linking
        date: date.toISOString().split('T')[0],
        sentiment: score,
        comparative: comparative,
        positiveWords: positive,
        negativeWords: negative,
        title: truncateText(text, 50), // Use helper
        emotionWords: words,
        textLength: text.length,
      };
    });

    const totalSentiment = sentiments.reduce((acc, item) => acc + item.sentiment, 0);
    const avgSentiment = sentiments.length > 0 ? totalSentiment / sentiments.length : 0;

    const allPositiveWords = sentiments.flatMap(item => item.positiveWords);
    const allNegativeWords = sentiments.flatMap(item => item.negativeWords);

    const positiveCounts = countItems(allPositiveWords);
    const negativeCounts = countItems(allNegativeWords);

    const topPositive = sortEntries(positiveCounts).slice(0, 10);
    const topNegative = sortEntries(negativeCounts).slice(0, 10);

    const processedSentiment = {
      items: sentiments,
      overall: {
        average: avgSentiment,
        total: totalSentiment,
        topPositive,
        topNegative,
        positiveCount: allPositiveWords.length,
        negativeCount: allNegativeWords.length
      }
    };
    return processedSentiment; // Return the result
  }, []); // Dependencies are stable (assuming helpers are pure)

  const calculateRelationships = useCallback((textData) => {
    const nodes = textData.map((item, index) => ({
      id: item.id || index.toString(), // Use item ID if available
      name: item.originalName || `Text ${index + 1}`,
      val: 1 + (item.processingResult || item.content || '').length / 1000, // Size based on length
    }));

    // Basic similarity linking (example - replace with actual logic)
    const links = [];
    // Placeholder: In a real app, implement TF-IDF, cosine similarity, etc.
    // For now, keep the random links for visual demonstration if needed, or omit.
    /*
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.8) { // Reduced frequency
          links.push({ source: nodes[i].id, target: nodes[j].id, value: Math.random() });
        }
      }
    }
    */
    return { nodes, links }; // Return the result
  }, []); // Dependencies are stable

  const calculateConcordance = useCallback((textToSearch, term) => {
    if (!term || term.trim() === '' || !textToSearch) {
      return []; // Return empty array
    }

    const searchTermLower = term.toLowerCase();
    const words = textToSearch.split(/\s+/); // Keep original case for context display
    const contextWindow = 7; // Slightly larger window
    const results = [];

    words.forEach((word, i) => {
      const cleaned = cleanWord(word); // Clean for comparison

      if (cleaned === searchTermLower) {
        const startIdx = Math.max(0, i - contextWindow);
        const endIdx = Math.min(words.length, i + contextWindow + 1); // Use length for slice end

        const contextWords = words.slice(startIdx, endIdx);

        results.push({
          position: i,
          // Highlight the matched word in context
          highlightedContext: contextWords
            .map((w, idx) => (startIdx + idx === i ? `<mark>${w}</mark>` : w))
            .join(' ')
        });
      }
    });
    return results; // Return the result
  }, []); // Dependencies are stable

  const calculateTTR = useCallback((textToCalc) => {
    if (!textToCalc || textToCalc.trim() === '') {
       return { ttr: 0, uniqueWords: 0, totalWords: 0 }; // Return default
    }

    const words = textToCalc.toLowerCase()
                      .split(/\s+/)
                      .filter(word => word.length > 0)
                      .map(cleanWord); // Use cleaner

    const totalWords = words.length;
    const uniqueWords = new Set(words).size;
    const ttr = totalWords > 0 ? uniqueWords / totalWords : 0;

    const processedTTR = { ttr, uniqueWords, totalWords };
    return processedTTR; // Return the result
  }, []); // Dependencies are stable

   const calculateTopicModeling = useCallback((textToModel) => {
     if (!textToModel || textToModel.trim() === '') {
         return []; // Return empty array
     }
    const sentences = textToModel.split(/[.!?]+/).filter(s => s.trim().length > 5); // Min sentence length
    const cooccurrences = {};

    sentences.forEach(sentence => {
      const words = sentence.toLowerCase()
                           .split(/\s+/)
                           .map(cleanWord)
                           .filter(word => word.length > 2 && !stopWords.has(word));

      const uniqueWordsInSentence = Array.from(new Set(words)); // Count co-occurrence once per sentence

      for (let i = 0; i < uniqueWordsInSentence.length; i++) {
        const word1 = uniqueWordsInSentence[i];
        if (!cooccurrences[word1]) cooccurrences[word1] = {};

        for (let j = i + 1; j < uniqueWordsInSentence.length; j++) {
          const word2 = uniqueWordsInSentence[j];
          cooccurrences[word1][word2] = (cooccurrences[word1][word2] || 0) + 1;
          // Ensure reverse link exists
          if (!cooccurrences[word2]) cooccurrences[word2] = {};
          cooccurrences[word2][word1] = (cooccurrences[word2][word1] || 0) + 1;
        }
      }
    });

    // Calculate word frequency based on co-occurrences
    const wordFrequency = Object.entries(cooccurrences).reduce((acc, [word, related]) => {
        acc[word] = Object.values(related).reduce((sum, count) => sum + count, 0);
        return acc;
    }, {});

    const sortedWords = Object.keys(wordFrequency)
                              .sort((a, b) => wordFrequency[b] - wordFrequency[a]);

    const topics = [];
    const processedWords = new Set();
    const maxTopics = 12; // More topics
    const relatedWordsCount = 5;

    for (const word of sortedWords) {
      if (processedWords.has(word) || !cooccurrences[word]) continue;

      const relatedWords = Object.keys(cooccurrences[word])
                                .sort((a, b) => cooccurrences[word][b] - cooccurrences[word][a])
                                .slice(0, relatedWordsCount);

      if (relatedWords.length > 0) { // Only add topic if related words exist
        topics.push({
          mainWord: word,
          relatedWords,
          strength: wordFrequency[word] // Use calculated frequency
        });

        // Mark words as processed to avoid overlap in topics
        processedWords.add(word);
        // relatedWords.forEach(relatedWord => processedWords.add(relatedWord)); // Option: prevent related words from being main words
      }

      if (topics.length >= maxTopics) break;
    }

    // Normalize strength relative to the top topic for visualization
    const maxStrength = topics[0]?.strength || 1;
    const finalTopics = topics.map(topic => ({
        ...topic,
        normalizedStrength: topic.strength / maxStrength
    }));

    return finalTopics; // Return the result
  }, [stopWords]); // Dependency is stable

  // --- Main Effect ---
  useEffect(() => {
    // Check if data is valid
    if (!data || data.length === 0) {
      // Reset all states if data is empty or invalid
      setWordFrequencyData([]);
      setSentimentData({ items: [], overall: {} });
      setRelationshipData({ nodes: [], links: [] });
      setConcordanceData([]); // Reset concordance
      setTtrData({ ttr: 0, uniqueWords: 0, totalWords: 0 });
      setTopicModelData([]);
      setIsLoading(false); // Ensure loading is off
      return; // Exit early
    }

    // Start loading state
    setIsLoading(true);

    try {
      // Perform calculations using the memoized 'allText' where appropriate
      const frequency = calculateWordFrequency(data);
      const sentiment = calculateSentimentAnalysis(data);
      const relationships = calculateRelationships(data);
      const ttr = calculateTTR(allText);
      const topics = calculateTopicModeling(allText);
      // Calculate initial empty concordance - important not to trigger state update loop here
      const initialConcordance = calculateConcordance(allText, '');

      // Update all states *after* calculations are done
      setWordFrequencyData(frequency);
      setSentimentData(sentiment);
      setRelationshipData(relationships);
      setTtrData(ttr);
      setTopicModelData(topics);
      setConcordanceData(initialConcordance); // Set initial empty concordance

    } catch (error) {
        console.error("Error during initial text analysis processing:", error);
        // Optionally set an error state here
    } finally {
        // Stop loading state regardless of success or error
        setIsLoading(false);
    }
    // Dependencies: Only 'data' and the memoized 'allText'.
    // The calculation functions are stable due to useCallback and stable dependencies.
  }, [data, allText, calculateWordFrequency, calculateSentimentAnalysis, calculateRelationships, calculateConcordance, calculateTTR, calculateTopicModeling]);

  // --- Concordance Search Function ---
  const searchConcordance = useCallback((term) => {
     // No need to recalculate allText, use the memoized version
     if (!allText) return; // Exit if no text
     // Calculate new concordance based on the term
     const results = calculateConcordance(allText, term);
     // Update only the concordance state
     setConcordanceData(results);
  }, [allText, calculateConcordance]); // Depends on memoized text and stable calculation function


  return {
    wordFrequencyData,
    sentimentData,
    relationshipData,
    concordanceData,
    ttrData,
    topicModelData,
    isLoading,
    searchConcordance,
  };
};

export default useTextAnalysis;
