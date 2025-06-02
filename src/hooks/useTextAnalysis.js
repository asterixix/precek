import { useState, useEffect, useCallback, useMemo } from "react";
import Sentiment from "sentiment";
import { automatedReadability } from "automated-readability";
import natural from "natural";
import {
  cleanWord,
  countItems,
  sortEntries,
  truncateText,
} from "../utils/helpers";

const STOP_WORDS = new Set([
  "the",
  "and",
  "a",
  "an",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "is",
  "are",
  "be",
  "this",
  "that",
  "with",
  "from",
  "by",
  "was",
  "were",
  "has",
  "have",
  "had",
  "it",
  "as",
  "not",
  "or",
  "but",
]);

// Local AFINN-like dictionary for custom sentiment scoring.
// This provides a consistent baseline and fallback.
const AFINN_DICT = {
  // Positive words
  good: 3,
  great: 4,
  excellent: 5,
  happy: 3,
  love: 3,
  awesome: 4,
  amazing: 4,
  best: 4,
  better: 2,
  nice: 3,
  wonderful: 4,
  fantastic: 4,
  perfect: 5,
  thank: 2,
  thanks: 2,
  positive: 2,
  beautiful: 3,
  joy: 3,
  agree: 1,
  appreciate: 2,
  glad: 3,
  impressive: 3,

  // Negative words
  bad: -3,
  worst: -5,
  terrible: -5,
  awful: -4,
  horrible: -5,
  hate: -4,
  poor: -3,
  negative: -2,
  wrong: -2,
  sad: -2,
  annoying: -2,
  disappointed: -3,
  disappointing: -3,
  failure: -3,
  fail: -2,
  problem: -2,
  sorry: -1,
  angry: -3,
  upset: -2,
  unfortunately: -2,
  boring: -2,
  difficult: -1,
  error: -2,
};

// NLP utility instances (created once for efficiency)
const WORD_TOKENIZER = new natural.WordTokenizer();
const SENTENCE_TOKENIZER = new natural.SentenceTokenizer();
const { PorterStemmer } = natural; // PorterStemmer is an object with a 'stem' method

const useTextAnalysis = (data) => {
  // --- State Declarations ---
  const [wordFrequencyData, setWordFrequencyData] = useState([]);
  const [sentimentData, setSentimentData] = useState({
    items: [],
    overall: {},
  });
  const [relationshipData, setRelationshipData] = useState({
    nodes: [],
    links: [],
  });
  const [concordanceData, setConcordanceData] = useState([]);
  const [ttrData, setTtrData] = useState({
    ttr: 0,
    uniqueWords: 0,
    totalWords: 0,
  });
  const [topicModelData, setTopicModelData] = useState([]);
  const [overviewData, setOverviewData] = useState(null); // Add state for overview data
  const [phraseLinkData, setPhraseLinkData] = useState({
    nodes: [],
    links: [],
  }); // Add state for phrase links
  const [wordByWordData, setWordByWordData] = useState([]); // Add state for word-by-word analysis
  const [trendsData, setTrendsData] = useState({}); // Add state for trends data
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the combined text to avoid recalculating it multiple times
  const allText = useMemo(() => {
    if (!data || data.length === 0) return "";
    return data
      .map((item) => item.processingResult || item.content || "")
      .join(" ");
  }, [data]);

  // Memoize pre-processed data items to avoid redundant cleaning and tokenization.
  const processedDataItems = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item, index) => {
      const text = item.processingResult || item.content || "";
      const lowerText = text.toLowerCase();

      // Basic tokenization for general use
      const generalTokens = WORD_TOKENIZER.tokenize(lowerText);

      // Words filtered for frequency, relationships (cleaned, non-stop-word, valid format)
      const filteredWords = generalTokens
        .map((token) => cleanWord(token)) // cleanWord also lowercases
        .filter(
          (word) =>
            word.length > 2 && /^[a-z]+$/i.test(word) && !STOP_WORDS.has(word)
        );

      return {
        id: item.id,
        originalText: text,
        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        originalName: item.originalName || `Text Item ${index + 1}`,
        filteredWords: filteredWords, // For frequency, relationships
        generalTokens: generalTokens, // For sentiment or other NLP tasks
      };
    });
  }, [data]); // Depends only on `data` as constants (STOP_WORDS, WORD_TOKENIZER) are stable.

  // --- Processing Functions ---

  const calculateWordFrequency = useCallback((items) => {
    if (!items || items.length === 0) return [];

    // Combine all filtered words from all items
    const allWords = items.flatMap((item) => item.filteredWords);
    const frequency = countItems(allWords);

    return sortEntries(frequency)
      .map(([word, count]) => ({ word, count }))
      .slice(0, 50); // Top 50
  }, []); // No external dependencies as `items` (processedDataItems) contains all needed info.

  const calculateSentimentAnalysis = useCallback((items) => {
    if (!items || items.length === 0) return { items: [], overall: {} };

    const standardAnalyzer = new Sentiment(); // Default lexicon

    // Custom AFINN-based analysis using the local AFINN_DICT
    const analyzeWithAFINN = (textTokens) => {
      let score = 0;
      let wordCount = 0;
      const positive = [];
      const negative = [];

      textTokens.forEach((token) => {
        const word = cleanWord(token); // Ensure consistency with AFINN_DICT keys
        if (AFINN_DICT[word] !== undefined) {
          const wordScore = AFINN_DICT[word];
          score += wordScore;
          wordCount++;
          if (wordScore > 0) positive.push(word);
          else if (wordScore < 0) negative.push(word);
        }
      });
      const comparative = wordCount > 0 ? score / wordCount : 0;

      return {
        score: score * 2, // Scale to be comparable with other lexicons
        comparative,
        positive,
        negative,
      };
    };

    // NLP.js-like analysis using Porter Stemmer and local AFINN_DICT
    const analyzeWithNLPjs = (textTokens) => {
      let score = 0;
      let wordCount = 0;
      const positive = [];
      const negative = [];

      textTokens.forEach((token) => {
        const word = cleanWord(token);
        const stemmed = PorterStemmer.stem(word);
        let wordScore;

        if (AFINN_DICT[word] !== undefined) {
          wordScore = AFINN_DICT[word] * 1.2;
        } else if (AFINN_DICT[stemmed] !== undefined) {
          wordScore = AFINN_DICT[stemmed] * 1.2;
        }

        if (wordScore !== undefined) {
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
        negative,
      };
    };

    let totalStandard = 0;
    let totalAfinn = 0;
    let totalNlpjs = 0;
    const sentimentResults = items.map((item) => {
      const standardResult = standardAnalyzer.analyze(item.originalText);
      const { score, comparative, words, positive, negative } = standardResult;
      const afinnResult = analyzeWithAFINN(item.generalTokens);
      const nlpjsResult = analyzeWithNLPjs(item.generalTokens);

      totalStandard += standardResult.score;
      totalAfinn += afinnResult.score;
      totalNlpjs += nlpjsResult.score;

      return {
        id: item.id,
        date: item.timestamp.toISOString().split("T")[0],
        sentiment: score,
        comparative: comparative,
        positiveWords: positive,
        negativeWords: negative,
        title: truncateText(item.originalText, 50),
        textLength: item.originalText.length,
        lexicons: {
          standard: { score, comparative },
          afinn: {
            score: afinnResult.score,
            comparative: afinnResult.comparative,
          },
          nlpjs: {
            score: nlpjsResult.score,
            comparative: nlpjsResult.comparative,
          },
        },
      };
    });

    const numItems = sentimentResults.length;
    const overallAvgSentiment = numItems > 0 ? totalStandard / numItems : 0;
    const overallAvgAfinn = numItems > 0 ? totalAfinn / numItems : 0;
    const overallAvgNlpjs = numItems > 0 ? totalNlpjs / numItems : 0;

    const allPositiveWords = sentimentResults.flatMap(
      (res) => res.positiveWords
    );
    const allNegativeWords = sentimentResults.flatMap(
      (res) => res.negativeWords
    );

    return {
      items: sentimentResults,
      overall: {
        average: overallAvgSentiment,
        total: totalStandard,
        topPositive: sortEntries(countItems(allPositiveWords)).slice(0, 10),
        topNegative: sortEntries(countItems(allNegativeWords)).slice(0, 10),
        positiveCount: allPositiveWords.length,
        negativeCount: allNegativeWords.length,
        lexiconAverages: {
          standard: overallAvgSentiment,
          afinn: overallAvgAfinn,
          nlpjs: overallAvgNlpjs,
        },
      },
    };
  }, []); // No dependencies needed as PorterStemmer and AFINN_DICT are stable constants.

  const calculateRelationships = useCallback((items) => {
    if (!items || items.length < 2) return { nodes: [], links: [] };

    const nodes = items.map((item, index) => ({
      id: item.id || index.toString(), // Use item ID if available
      name: item.originalName || `Text ${index + 1}`,
      val: 1 + (item.originalText || "").length / 1000, // size based on text length
      wordsSet: new Set(item.filteredWords), // Use pre-filtered words for comparison
    }));

    // --- Link Generation Logic ---
    const links = [];
    const minSharedWords = 3; // Minimum shared words to create a link (adjustable)

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];

        // Find intersection of word sets
        const intersection = new Set(
          [...node1.wordsSet].filter((word) => node2.wordsSet.has(word))
        );
        const sharedWordCount = intersection.size;

        if (sharedWordCount >= minSharedWords) {
          links.push({
            source: node1.id,
            target: node2.id,
            value: sharedWordCount, // Link strength based on shared word count
          });
        }
      }
    }
    // Remove temporary 'wordsSet' from final node data
    const finalNodes = nodes.map(({ wordsSet, ...rest }) => rest);
    return { nodes: finalNodes, links };
  }, []); // Depends only on `items` (processedDataItems).

  const calculateConcordance = useCallback((textToSearch, term) => {
    if (!term || term.trim() === "" || !textToSearch) {
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
            .join(" "),
        });
      }
    });
    return results; // Return the result
  }, []); // Dependencies are stable.

  // Calculates Type-Token Ratio (TTR)
  const calculateTTR = useCallback((textToCalc) => {
    if (!textToCalc || textToCalc.trim() === "") {
      return { ttr: 0, uniqueWords: 0, totalWords: 0 }; // Return default
    }
    // Use general tokenization and cleaning for TTR
    const words = WORD_TOKENIZER.tokenize(textToCalc.toLowerCase())
      .map(cleanWord)
      .filter((word) => word.length > 0);

    const totalWords = words.length;
    const uniqueWords = new Set(words).size;
    const ttr = totalWords > 0 ? uniqueWords / totalWords : 0;

    return { ttr, uniqueWords, totalWords };
  }, []); // Dependences are stable.

  const calculateTopicModeling = useCallback((textToModel) => {
    if (!textToModel || textToModel.trim() === "") return [];

    const sentences = SENTENCE_TOKENIZER.tokenize(textToModel).filter(
      (s) => s.trim().length > 10
    ); // Consider sentences with some substance

    const cooccurrences = {};

    sentences.forEach((sentence) => {
      const words = WORD_TOKENIZER.tokenize(sentence.toLowerCase())
        .map(cleanWord)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

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
    const wordFrequency = Object.entries(cooccurrences).reduce(
      (acc, [word, related]) => {
        acc[word] = Object.values(related).reduce(
          (sum, count) => sum + count,
          0
        );
        return acc;
      },
      {}
    );

    const sortedWords = Object.keys(wordFrequency).sort(
      (a, b) => wordFrequency[b] - wordFrequency[a]
    );

    const topics = [];
    const processedWords = new Set();
    const maxTopics = 12; // More topics
    const relatedWordsCount = 5;

    for (const word of sortedWords) {
      if (processedWords.has(word) || !cooccurrences[word]) continue;

      const relatedWords = Object.keys(cooccurrences[word])
        .sort((a, b) => cooccurrences[word][b] - cooccurrences[word][a])
        .slice(0, relatedWordsCount);

      if (relatedWords.length > 0) {
        // Only add topic if related words exist
        topics.push({
          mainWord: word,
          relatedWords,
          strength: wordFrequency[word], // Use calculated frequency
        });

        // Mark words as processed to avoid overlap in topics
        processedWords.add(word);
        // relatedWords.forEach(relatedWord => processedWords.add(relatedWord)); // Option: prevent related words from being main words
      }
      if (topics.length >= maxTopics) break;
    }

    // Normalize strength relative to the top topic for visualization
    const maxStrength = topics[0]?.strength || 1;
    return topics.map((topic) => ({
      ...topic,
      normalizedStrength: topic.strength / maxStrength,
    }));
  }, []); // Depends on stable constants (SENTENCE_TOKENIZER, WORD_TOKENIZER, STOP_WORDS, cleanWord).

  // Calculate an overview summary
  const calculateOverviewSummary = useCallback(
    (items, combinedText, ttrResult) => {
      if (!items || items.length === 0 || !combinedText) {
        return {
          totalWords: 0,
          totalPhrases: 0,
          totalTexts: 0,
          vocabularyDensity: 0,
          readabilityIndex: null,
          avgWordsPerSentence: 0,
          phraseGraphData: { nodes: [], links: [] },
        };
      }

      const totalTexts = items.length;
      const { totalWords, ttr: vocabularyDensity } = ttrResult;

      const sentences = SENTENCE_TOKENIZER.tokenize(combinedText);
      const totalSentences = sentences.length > 0 ? sentences.length : 1;
      const avgWordsPerSentence =
        totalWords > 0 && totalSentences > 0 ? totalWords / totalSentences : 0;

      // Calculate Readability using automated-readability
      let readabilityIndex = null;
      if (totalWords > 0 && totalSentences > 0) {
        // Ensure counts are valid
        try {
          // Calculate character count (simple length)
          const totalCharacters = combinedText.length;

          // Prepare counts object for the library
          const counts = {
            sentence: totalSentences,
            word: totalWords,
            character: totalCharacters,
          };

          // Calculate the Automated Readability Index (ARI)
          readabilityIndex = automatedReadability(counts);
        } catch (e) {
          console.error("Error calculating automated readability:", e);
          readabilityIndex = null; // Set to null if calculation fails
        }
      }

      // Phrase analysis (bigrams)
      const wordsForPhrases = WORD_TOKENIZER.tokenize(
        combinedText.toLowerCase()
      )
        .map(cleanWord)
        .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
      const bigrams = natural.NGrams.bigrams(wordsForPhrases);
      const phraseCounts = countItems(bigrams.map((bg) => bg.join(" ")));

      const significantPhrases = sortEntries(phraseCounts)
        .filter(([, count]) => count > 1) // Phrases appearing more than once
        .slice(0, 50); // Top 50 significant phrases

      const totalPhrases = significantPhrases.length;

      const phraseNodes = significantPhrases.map(([phrase, count]) => ({
        id: phrase,
        name: phrase,
        val: count, // Node size by frequency
      }));

      // --- Link Generation Logic ---
      const phraseLinks = [];
      // Link phrases that share at least one word (simple co-occurrence proxy)
      // Note: This is a basic approach. More sophisticated methods could analyze proximity in the text.
      const nodeMap = new Map(phraseNodes.map((node) => [node.id, node])); // For quick lookup

      for (const node1 of phraseNodes) {
        const words1 = new Set(node1.id.split(" ")); // Use Set for efficient lookup

        for (const node2 of phraseNodes) {
          const words2 = node2.id.split(" ");

          // Check if any word from phrase 2 exists in phrase 1
          if (words2.some((w) => words1.has(w))) {
            // Add link, value could represent combined frequency or a fixed value
            phraseLinks.push({
              source: node1.id,
              target: node2.id,
              // Optional: Add value based on node frequencies for potential link styling
              value: (node1.val + node2.val) / 2, // Example: average frequency
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
        phraseGraphData: { nodes: phraseNodes, links: phraseLinks }, // Include graph data with generated links
      };
    },
    []
  ); // Depends on stable constants.
  
  // --- Trends Analysis Function ---
  const calculateTrends = useCallback((items) => {
    if (!items || items.length === 0) return {};

    const documentAnalysis = [];
    const allWordEvolution = {};

    // Analyze each document separately by dividing it into 4 text segments
    items.forEach((item, itemIndex) => {
      const text = item.originalText;
      if (!text || text.trim() === "") return;

      // Tokenize the entire text
      const words = WORD_TOKENIZER.tokenize(text.toLowerCase())
        .map(cleanWord)
        .filter(word => word.length > 2 && /^[a-z]+$/i.test(word) && !STOP_WORDS.has(word));

      if (words.length === 0) return;

      // Divide text into 4 segments (beginning, early-middle, late-middle, end)
      const segmentSize = Math.max(1, Math.floor(words.length / 4));
      const textSegments = [];
      
      for (let i = 0; i < 4; i++) {
        const startIdx = i * segmentSize;
        const endIdx = i === 3 ? words.length : (i + 1) * segmentSize; // Last segment gets remaining words
        textSegments.push(words.slice(startIdx, endIdx));
      }

      // Analyze word frequency in each text segment
      const segmentAnalysis = textSegments.map((segmentWords, segmentIndex) => {
        const wordFrequency = countItems(segmentWords);
        const topWords = sortEntries(wordFrequency)
          .slice(0, 10)
          .map(([word, count]) => ({
            word,
            count,
            frequency: segmentWords.length > 0 ? count / segmentWords.length : 0
          }));

        return {
          segmentId: segmentIndex,
          position: `${Math.round((segmentIndex / 3) * 100)}%`, // 0%, 33%, 67%, 100%
          topWords,
          totalWords: segmentWords.length,
          uniqueWords: new Set(segmentWords).size
        };
      });

      // Track word evolution within this document
      const documentWordEvolution = {};
      segmentAnalysis.forEach((segment, segmentIndex) => {
        segment.topWords.forEach(({ word, frequency }) => {
          if (!documentWordEvolution[word]) {
            documentWordEvolution[word] = new Array(4).fill(0);
          }
          documentWordEvolution[word][segmentIndex] = frequency;

          if (!allWordEvolution[word]) {
            allWordEvolution[word] = [];
          }
          allWordEvolution[word].push({
            documentId: item.id,
            documentName: item.originalName,
            segmentIndex,
            frequency
          });
        });
      });

      // Calculate trending words for this document
      const documentTrendingWords = Object.entries(documentWordEvolution)
        .map(([word, frequencies]) => {
          const start = frequencies[0];
          const end = frequencies[frequencies.length - 1];
          const change = end - start;
          const avgFrequency = frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length;
          return { word, change, frequencies, avgFrequency };
        })
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
        .slice(0, 10);

      documentAnalysis.push({
        documentId: item.id,
        documentName: item.originalName,
        segments: segmentAnalysis,
        trendingWords: documentTrendingWords,
        totalWords: words.length
      });
    });

    // Calculate overall trending words across all documents
    const overallTrending = Object.entries(allWordEvolution)
      .map(([word, occurrences]) => {
        const avgChange = occurrences.reduce((sum, occ, idx) => {
          if (idx === 0) return 0;
          const prevOcc = occurrences.find(o => o.documentId === occ.documentId && o.segmentIndex === 0);
          return sum + (occ.frequency - (prevOcc?.frequency || 0));
        }, 0) / occurrences.length;

        return {
          word,
          avgChange,
          totalOccurrences: occurrences.length,
          documents: [...new Set(occurrences.map(o => o.documentId))].length
        };
      })
      .sort((a, b) => Math.abs(b.avgChange) - Math.abs(a.avgChange))
      .slice(0, 15);

    return {
      documents: documentAnalysis,
      overallTrending,
      totalDocuments: documentAnalysis.length,
      segmentLabels: ['Beginning', 'Early Middle', 'Late Middle', 'End']
    };
  }, []);

  // --- Word-by-Word Analysis Function ---
  const calculateWordByWordAnalysis = useCallback((text) => {
    if (!text || text.trim() === "") return [];
    // Tokenize and keep track of positions
    const words = WORD_TOKENIZER.tokenize(text);
    const wordMap = {};
    words.forEach((word, idx) => {
      const cleaned = cleanWord(word);
      if (!cleaned) return;
      if (!wordMap[cleaned]) {
        wordMap[cleaned] = { word: cleaned, positions: [], count: 0 };
      }
      wordMap[cleaned].positions.push(idx);
      wordMap[cleaned].count += 1;
    });
    // Convert to array and sort by first position
    return Object.values(wordMap).sort(
      (a, b) => a.positions[0] - b.positions[0]
    );
  }, []);

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
      setWordByWordData([]); // Reset word-by-word data
      setTrendsData({}); // Reset trends data
      setIsLoading(false); // Ensure loading is off
      return; // Exit early
    }

    // Start loading state
    setIsLoading(true);

    try {
      // Perform calculations using the memoized 'allText' where appropriate
      const frequency = calculateWordFrequency(processedDataItems);
      const sentiment = calculateSentimentAnalysis(processedDataItems);
      const relationships = calculateRelationships(processedDataItems);
      const ttr = calculateTTR(allText); // Calculate TTR first
      const topics = calculateTopicModeling(allText);
      // Calculate overview summary, passing calculated TTR data
      const summary = calculateOverviewSummary(
        processedDataItems,
        allText,
        ttr
      );
      // Calculate initial empty concordance - important not to trigger state update loop here
      const initialConcordance = calculateConcordance(allText, "");
      const wordByWord = calculateWordByWordAnalysis(allText);
      const trends = calculateTrends(processedDataItems); // Calculate trends data

      // Update all states *after* calculations are done
      setWordFrequencyData(frequency);
      setSentimentData(sentiment);
      setRelationshipData(relationships);
      setTtrData(ttr); // Set TTR state
      setTopicModelData(topics);
      setOverviewData(summary); // Set overview state
      setPhraseLinkData(summary.phraseGraphData); // Set phrase link state
      setConcordanceData(initialConcordance); // Set initial empty concordance
      setWordByWordData(wordByWord);
      setTrendsData(trends);
    } catch (error) {
      console.error("Error during initial text analysis processing:", error);
      // Optionally set an error state here
    } finally {
      // Stop loading state regardless of success or error
      setIsLoading(false);
    }
    // Dependencies: Only 'data' and the memoized 'allText'.
    // The calculation functions are stable due to useCallback and stable dependencies.
  }, [
    data,
    allText,
    calculateWordFrequency,
    calculateSentimentAnalysis,
    calculateRelationships,
    calculateConcordance,
    calculateTTR,
    calculateTopicModeling,
    calculateOverviewSummary,
    calculateWordByWordAnalysis,
    calculateTrends,
  ]); // Add calculateOverviewSummary and calculateWordByWordAnalysis dependencies

  // --- Concordance Search Function ---
  const searchConcordance = useCallback(
    (term) => {
      // No need to recalculate allText, use the memoized version
      if (!allText) return; // Exit if no text
      // Calculate new concordance based on the term
      const results = calculateConcordance(allText, term);
      // Update only the concordance state
      setConcordanceData(results);
    },
    [allText, calculateConcordance]
  ); // Depends on memoized text and stable calculation function

  return {
    overviewData, // Return overview data
    wordFrequencyData,
    sentimentData,
    relationshipData,
    concordanceData,
    ttrData,
    topicModelData,
    phraseLinkData, // Return phrase link data
    wordByWordData, // Add word-by-word data
    trendsData,
    isLoading,
    searchConcordance,
  };
};

export default useTextAnalysis;
