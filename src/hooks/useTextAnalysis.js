import { useState, useEffect, useCallback, useMemo } from 'react';
import Sentiment from 'sentiment';
import { automatedReadability } from 'automated-readability';
import natural from 'natural'; // Import natural

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
  const [overviewData, setOverviewData] = useState(null); // Add state for overview data
  const [phraseLinkData, setPhraseLinkData] = useState({ nodes: [], links: [] }); // Add state for phrase links
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the combined text to avoid recalculating it multiple times
  const allText = useMemo(() => {
    if (!data || data.length === 0) return '';
    return data.map(item => item.processingResult || item.content || '').join(' ');
  }, [data]);

  // --- Processing Functions ---

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
    // Initialize different sentiment analyzers
    const standardAnalyzer = new Sentiment(); // Default lexicon
    
    // Create tokenizer for use with both AFINN and NLP.js analysis
    const { WordTokenizer, PorterStemmer } = natural;
    const tokenizer = new WordTokenizer();
    
    // Create a local AFINN-like dictionary for sentiment scoring
    // This is a fallback in case the afinn-165 package isn't working correctly
    const afinnDict = {
      // Positive words
      'good': 3, 'great': 4, 'excellent': 5, 'happy': 3, 'love': 3, 'awesome': 4,
      'amazing': 4, 'best': 4, 'better': 2, 'nice': 3, 'wonderful': 4, 'fantastic': 4,
      'perfect': 5, 'thank': 2, 'thanks': 2, 'positive': 2, 'beautiful': 3, 'joy': 3,
      'agree': 1, 'appreciate': 2, 'excellent': 5, 'glad': 3, 'impressive': 3,
      
      // Negative words
      'bad': -3, 'worst': -5, 'terrible': -5, 'awful': -4, 'horrible': -5, 'hate': -4,
      'poor': -3, 'negative': -2, 'wrong': -2, 'sad': -2, 'annoying': -2, 'disappointed': -3,
      'disappointing': -3, 'failure': -3, 'fail': -2, 'problem': -2, 'sorry': -1, 'angry': -3,
      'upset': -2, 'unfortunately': -2, 'boring': -2, 'difficult': -1, 'error': -2
    };
    
    // Custom AFINN analysis using our local dictionary
    const analyzeWithAFINN = (text) => {
      const tokens = tokenizer.tokenize(text);
      let score = 0;
      let wordCount = 0;
      const positive = [];
      const negative = [];
      
      tokens.forEach(token => {
        const word = token.toLowerCase();
        // Use our local dictionary instead of the imported one
        if (afinnDict[word] !== undefined) {
          const wordScore = afinnDict[word];
          score += wordScore;
          wordCount++;
          
          if (wordScore > 0) {
            positive.push(word);
          } else if (wordScore < 0) {
            negative.push(word);
          }
        }
      });
      
      const comparative = wordCount > 0 ? score / wordCount : 0;
      
      return {
        score: score * 2, // Scale to be comparable with other lexicons
        comparative,
        positive,
        negative
      };
    };
    
    // Function to perform NLP.js-like sentiment analysis
    const analyzeWithNLPjs = (text) => {
      const tokens = tokenizer.tokenize(text);
      let score = 0;
      let wordCount = 0;
      const positive = [];
      const negative = [];
      
      tokens.forEach(token => {
        const word = token.toLowerCase();
        const stemmed = PorterStemmer.stem(word);
        
        // Check both the original word and stemmed version in our dictionary
        if (afinnDict[word] !== undefined) {
          const wordScore = afinnDict[word] * 1.2; // Different multiplier
          score += wordScore;
          wordCount++;
          
          if (wordScore > 0) {
            positive.push(word);
          } else if (wordScore < 0) {
            negative.push(word);
          }
        } else if (afinnDict[stemmed] !== undefined) {
          const wordScore = afinnDict[stemmed] * 1.2;
          score += wordScore;
          wordCount++;
          
          if (wordScore > 0) {
            positive.push(stemmed);
          } else if (wordScore < 0) {
            negative.push(stemmed);
          }
        }
      });
      
      const comparative = wordCount > 0 ? score / wordCount : 0;
      
      return {
        score: score * 1.5, // Scale for display purposes
        comparative,
        positive,
        negative
      };
    };
    
    let totalStandard = 0;
    let totalAfinn = 0;
    let totalNlpjs = 0;
    
    const sentiments = textData.map(item => {
      const text = item.processingResult || item.content || '';
      const date = item.timestamp ? new Date(item.timestamp) : new Date();
      
      // Standard sentiment analysis
      const standardResult = standardAnalyzer.analyze(text);
      const { score, comparative, words, positive, negative } = standardResult;
      
      // Use custom AFINN analysis instead of SentimentAnalyzer
      const afinnResult = analyzeWithAFINN(text);
      
      // NLP.js style analysis
      const nlpjsResult = analyzeWithNLPjs(text);
      
      // Add to totals for average calculations
      totalStandard += score;
      totalAfinn += afinnResult.score;
      totalNlpjs += nlpjsResult.score;
      
      return {
        id: item.id,
        date: date.toISOString().split('T')[0],
        sentiment: score,
        comparative: comparative,
        positiveWords: positive,
        negativeWords: negative,
        title: truncateText(text, 50),
        textLength: text.length,
        lexicons: {
          standard: { score, comparative },
          afinn: { 
            score: afinnResult.score, 
            comparative: afinnResult.comparative 
          },
          nlpjs: { 
            score: nlpjsResult.score, 
            comparative: nlpjsResult.comparative 
          }
        }
      };
    });

    // Calculate overall metrics
    const totalSentiment = sentiments.reduce((acc, item) => acc + item.sentiment, 0);
    const avgSentiment = sentiments.length > 0 ? totalSentiment / sentiments.length : 0;
    
    // Calculate lexicon-specific averages
    const avgAfinn = sentiments.length > 0 ? totalAfinn / sentiments.length : 0;
    const avgNlpjs = sentiments.length > 0 ? totalNlpjs / sentiments.length : 0;

    const allPositiveWords = sentiments.flatMap(item => item.positiveWords);
    const allNegativeWords = sentiments.flatMap(item => item.negativeWords);

    const positiveCounts = countItems(allPositiveWords);
    const negativeCounts = countItems(allNegativeWords);

    return {
      items: sentiments,
      overall: {
        average: avgSentiment,
        total: totalSentiment,
        topPositive: sortEntries(positiveCounts).slice(0, 10),
        topNegative: sortEntries(negativeCounts).slice(0, 10),
        positiveCount: allPositiveWords.length,
        negativeCount: allNegativeWords.length,
        lexiconAverages: {
          standard: avgSentiment,
          afinn: avgAfinn,
          nlpjs: avgNlpjs
        }
      }
    };
  }, []); // No dependencies needed

  const calculateRelationships = useCallback((textData) => {
    const nodes = textData.map((item, index) => ({
      id: item.id || index.toString(), // Use item ID if available
      name: item.originalName || `Text ${index + 1}`,
      val: 1 + (item.processingResult || item.content || '').length / 1000, // Size based on length
      // Store cleaned words for comparison
      words: new Set(
        (item.processingResult || item.content || '')
          .toLowerCase()
          .split(/\s+/)
          .map(cleanWord)
          .filter(word => word.length > 2 && !stopWords.has(word))
      )
    }));

    // --- Link Generation Logic ---
    const links = [];
    const minSharedWords = 3; // Minimum shared words to create a link (adjustable)

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];

        // Find intersection of word sets
        const intersection = new Set([...node1.words].filter(word => node2.words.has(word)));
        const sharedWordCount = intersection.size;

        if (sharedWordCount >= minSharedWords) {
          links.push({
            source: node1.id,
            target: node2.id,
            value: sharedWordCount // Link strength based on shared word count
          });
        }
      }
    }
    // --- End Link Generation Logic ---

    // Clean up nodes data before returning (remove temporary 'words' set)
    const finalNodes = nodes.map(({ words, ...rest }) => rest);

    return { nodes: finalNodes, links }; // Return nodes without the 'words' set and the generated links
  }, [stopWords]); // Add stopWords dependency

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

  // New function to calculate overview summary
  const calculateOverviewSummary = useCallback((textData, combinedText, calculatedTtrData) => {
    if (!textData || textData.length === 0 || !combinedText) {
      return {
        totalWords: 0,
        totalPhrases: 0,
        totalTexts: 0,
        vocabularyDensity: 0,
        readabilityIndex: null,
        avgWordsPerSentence: 0,
      };
    }

    const totalTexts = textData.length;
    const { totalWords, ttr: vocabularyDensity } = calculatedTtrData; // Reuse TTR calculation

    // Calculate Avg Words Per Sentence
    const sentenceTokenizer = new natural.SentenceTokenizer();
    const sentences = sentenceTokenizer.tokenize(combinedText);
    const totalSentences = sentences.length > 0 ? sentences.length : 1; // Avoid division by zero
    const avgWordsPerSentence = totalWords / totalSentences;

    // Calculate Readability using automated-readability
    let readabilityIndex = null;
    if (totalWords > 0 && totalSentences > 0) { // Ensure counts are valid
        try {
            // Calculate character count (simple length)
            const totalCharacters = combinedText.length;

            // Prepare counts object for the library
            const counts = {
                sentence: totalSentences,
                word: totalWords,
                character: totalCharacters
            };

            // Calculate the Automated Readability Index (ARI)
            readabilityIndex = automatedReadability(counts);

        } catch (e) {
            console.error("Error calculating automated readability:", e);
            readabilityIndex = null; // Set to null if calculation fails
        }
    }


    // Calculate Total Phrases (Example: Count common bigrams)
    const wordTokenizer = new natural.WordTokenizer();
    const words = wordTokenizer.tokenize(combinedText.toLowerCase())
                               .filter(word => word.length > 1 && !stopWords.has(word)); // Basic filtering
    const bigrams = natural.NGrams.bigrams(words);
    const phraseCounts = bigrams.reduce((acc, phraseArr) => {
        const phrase = phraseArr.join(' ');
        acc[phrase] = (acc[phrase] || 0) + 1;
        return acc;
    }, {});
    // Consider a phrase significant if it appears more than once (adjust threshold as needed)
    const significantPhrases = Object.entries(phraseCounts).filter(([phrase, count]) => count > 1);
    const totalPhrases = significantPhrases.length; // Count of unique significant phrases

    // Prepare data for PhraseLinkTab (nodes = phrases, links = co-occurrence - simplified)
    const phraseNodes = significantPhrases.slice(0, 50).map(([phrase, count]) => ({ // Limit nodes
        id: phrase,
        name: phrase,
        val: count // Size node by frequency
    }));

    // --- Link Generation Logic ---
    const phraseLinks = [];
    // Link phrases that share at least one word (simple co-occurrence proxy)
    // Note: This is a basic approach. More sophisticated methods could analyze proximity in the text.
    const nodeMap = new Map(phraseNodes.map(node => [node.id, node])); // For quick lookup

    for (let i = 0; i < phraseNodes.length; i++) {
        const node1 = phraseNodes[i];
        const words1 = new Set(node1.id.split(' ')); // Use Set for efficient lookup

        for (let j = i + 1; j < phraseNodes.length; j++) {
            const node2 = phraseNodes[j];
            const words2 = node2.id.split(' ');

            // Check if any word from phrase 2 exists in phrase 1
            if (words2.some(w => words1.has(w))) {
                 // Add link, value could represent combined frequency or a fixed value
                 phraseLinks.push({
                     source: node1.id,
                     target: node2.id,
                     // Optional: Add value based on node frequencies for potential link styling
                     value: (node1.val + node2.val) / 2 // Example: average frequency
                 });
            }
        }
    }
    // --- End Link Generation Logic ---


    return {
      totalWords,
      totalPhrases,
      totalTexts,
      vocabularyDensity,
      readabilityIndex, // This now holds the ARI score
      avgWordsPerSentence,
      phraseGraphData: { nodes: phraseNodes, links: phraseLinks } // Include graph data with generated links
    };
  }, [stopWords]); // Dependencies are stable

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
      setOverviewData(null); // Reset overview
      setPhraseLinkData({ nodes: [], links: [] }); // Reset phrase links
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
      const ttr = calculateTTR(allText); // Calculate TTR first
      const topics = calculateTopicModeling(allText);
      // Calculate overview summary, passing calculated TTR data
      const summary = calculateOverviewSummary(data, allText, ttr);
      // Calculate initial empty concordance - important not to trigger state update loop here
      const initialConcordance = calculateConcordance(allText, '');

      // Update all states *after* calculations are done
      setWordFrequencyData(frequency);
      setSentimentData(sentiment);
      setRelationshipData(relationships);
      setTtrData(ttr); // Set TTR state
      setTopicModelData(topics);
      setOverviewData(summary); // Set overview state
      setPhraseLinkData(summary.phraseGraphData); // Set phrase link state
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
  }, [data, allText, calculateWordFrequency, calculateSentimentAnalysis, calculateRelationships, calculateConcordance, calculateTTR, calculateTopicModeling, calculateOverviewSummary]); // Add calculateOverviewSummary dependency

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
    overviewData, // Return overview data
    wordFrequencyData,
    sentimentData,
    relationshipData,
    concordanceData,
    ttrData,
    topicModelData,
    phraseLinkData, // Return phrase link data
    isLoading,
    searchConcordance,
  };
};

export default useTextAnalysis;
