import { useState, useEffect, useCallback, useMemo } from 'react';
import Sentiment from 'sentiment';
import { automatedReadability } from 'automated-readability';
import natural from 'natural';
// Fix the import to use the proper named export
import { afinn165 } from 'afinn-165';
// Import nlp.js components (you'll need to install this: npm install @nlpjs/sentiment)
import { SentimentAnalyzer } from '@nlpjs/sentiment';
import { Container } from '@nlpjs/core';
import { LangEn } from '@nlpjs/lang-en';

// Verify AFINN data is valid or create an empty object
const safeAfinnData = (typeof afinn165 === 'object' && afinn165 !== null) ? afinn165 : {};

// Helper functions
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

// Fix the initializeNlpjsAnalyzer function to properly handle initialization errors
const initializeNlpjsAnalyzer = () => {
  try {
    // Create a container
    const container = new Container();
    
    // Register the English language
    container.use(LangEn);
    
    // Create and register the sentiment analyzer
    container.use(SentimentAnalyzer);
    
    // Remove container.train() since it's not a function
    
    // Check if sentiment analysis is available in the container
    if (container.sentiment) {
      return {
        analyze: (text) => {
          try {
            if (!text || typeof text !== 'string') return { 
              score: 0, comparative: 0, vote: 'neutral', positive: [], negative: []
            };
            
            // Process the text using the container
            const result = container.sentiment.process({ locale: 'en', text });
            
            // Normalize the results for our application
            return {
              score: result.score * 10, // Scale to match our other lexicons
              comparative: result.score,
              vote: result.vote || 'neutral',
              positive: result.positive || [],
              negative: result.negative || [],
              type: 'nlpjs'
            };
          } catch (err) {
            console.error('Error in nlp.js sentiment analyzer:', err);
            return { score: 0, comparative: 0, vote: 'neutral', positive: [], negative: [], type: 'nlpjs' };
          }
        }
      };
    } else {
      // Fallback if container doesn't have sentiment
      console.warn('NLP.js container does not have a sentiment analyzer');
      return createFallbackAnalyzer();
    }
  } catch (err) {
    console.error('Failed to initialize nlp.js sentiment analyzer:', err);
    return createFallbackAnalyzer();
  }
};

// Create a fallback analyzer for when NLP.js fails
const createFallbackAnalyzer = () => {
  // Simple fallback sentiment analyzer
  return {
    analyze: (text) => {
      if (!text || typeof text !== 'string') return { 
        score: 0, comparative: 0, vote: 'neutral', positive: [], negative: [], type: 'fallback' 
      };
      
      // Very basic sentiment analysis - just count positive and negative words
      const basicPositive = ['good', 'great', 'excellent', 'best', 'happy', 'positive'];
      const basicNegative = ['bad', 'worst', 'terrible', 'negative', 'poor', 'sad'];
      
      const words = text.toLowerCase().split(/\s+/);
      const positive = words.filter(word => basicPositive.includes(word));
      const negative = words.filter(word => basicNegative.includes(word));
      
      const score = positive.length - negative.length;
      
      return {
        score: score,
        comparative: words.length > 0 ? score / words.length : 0,
        vote: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
        positive,
        negative,
        type: 'fallback'
      };
    }
  };
};

// Create a lexicon-based sentiment analyzer wrapper
const createMultiLexiconAnalyzer = () => {
  // Standard sentiment analyzer
  const standardAnalyzer = new Sentiment();
  
  // Create AFINN analyzer with proper access to the afinn165 object
  const afinnAnalyzer = (text) => {
    try {
      if (!text || typeof text !== 'string') return { 
        score: 0, comparative: 0, positive: [], negative: [], type: 'afinn' 
      };
      
      const words = text.toLowerCase().split(/\s+/);
      
      // Check if we have valid AFINN data before processing
      if (!safeAfinnData || Object.keys(safeAfinnData).length === 0) {
        console.warn('AFINN dictionary is empty or invalid - using direct values');
        // Fallback to a minimal set of AFINN words
        const fallbackAfinn = {
          'good': 3, 'nice': 3, 'great': 3, 'excellent': 4, 'fantastic': 4,
          'bad': -3, 'awful': -3, 'terrible': -4, 'horrible': -4, 'poor': -2
        };
        
        // Process with fallback
        let score = 0;
        const positive = [];
        const negative = [];
        
        words.forEach(word => {
          const cleanWord = word.replace(/[^\w]/g, '');
          if (fallbackAfinn[cleanWord]) {
            score += fallbackAfinn[cleanWord];
            if (fallbackAfinn[cleanWord] > 0) positive.push(cleanWord);
            if (fallbackAfinn[cleanWord] < 0) negative.push(cleanWord);
          }
        });
        
        return {
          score,
          comparative: words.length > 0 ? score / words.length : 0,
          positive,
          negative,
          type: 'afinn-fallback'
        };
      }
      
      // Regular processing with loaded AFINN data - use hasOwnProperty check as recommended
      // by the package documentation
      let score = 0;
      const positive = [];
      const negative = [];
      
      words.forEach(word => {
        const cleanWord = word.replace(/[^\w]/g, '');
        // Use hasOwnProperty check to safely access AFINN dict as recommended
        if (safeAfinnData.hasOwnProperty(cleanWord)) {
          const wordScore = safeAfinnData[cleanWord];
          score += wordScore;
          if (wordScore > 0) positive.push(cleanWord);
          if (wordScore < 0) negative.push(cleanWord);
        }
      });
      
      return {
        score,
        comparative: words.length > 0 ? score / words.length : 0,
        positive,
        negative,
        type: 'afinn'
      };
    } catch (err) {
      console.error('Error in AFINN analyzer:', err);
      return { score: 0, comparative: 0, positive: [], negative: [], type: 'afinn' };
    }
  };
  
  // Create a domain-specific custom analyzer
  const customAnalyzer = (text) => {
    // Extended custom lexicon with more domain-specific terms
    const customLexicon = {
      // Positive terms
      'innovative': 3,
      'breakthrough': 3,
      'seamless': 2,
      'intuitive': 2,
      'efficient': 2,
      'effective': 2,
      'impressive': 3,
      'powerful': 2,
      'insightful': 3,
      'valuable': 2,
      'useful': 2,
      'clear': 1,
      'simple': 1,
      'helpful': 2,
      'fantastic': 3,
      'amazing': 3,
      'excellent': 3,
      'smooth': 2,
      
      // Negative terms
      'bug': -2,
      'crash': -3,
      'complex': -1,
      'confusing': -2,
      'difficult': -2,
      'issue': -1,
      'problem': -2,
      'error': -2,
      'frustrating': -3,
      'slow': -2,
      'complicated': -2,
      'broken': -3,
      'disappointing': -2,
      'useless': -3,
      'unstable': -2,
      'failure': -3,
      'inconsistent': -2,
      'unclear': -1
    };
    
    try {
      if (!text || typeof text !== 'string') return { 
        score: 0, comparative: 0, positive: [], negative: [], type: 'custom' 
      };
      
      const words = text.toLowerCase().split(/\s+/);
      let score = 0;
      const positive = [];
      const negative = [];
      
      words.forEach(word => {
        const cleanWord = word.replace(/[^\w]/g, '');
        if (customLexicon[cleanWord]) {
          score += customLexicon[cleanWord];
          if (customLexicon[cleanWord] > 0) positive.push(cleanWord);
          if (customLexicon[cleanWord] < 0) negative.push(cleanWord);
        }
      });
      
      return {
        score,
        comparative: words.length > 0 ? score / words.length : 0,
        positive,
        negative,
        type: 'custom'
      };
    } catch (err) {
      console.error('Error in custom analyzer:', err);
      return { score: 0, comparative: 0, positive: [], negative: [], type: 'custom' };
    }
  };
  
  // Get nlp.js analyzer (or fallback)
  const nlpjsAnalyzer = initializeNlpjsAnalyzer();
  
  // Enhanced analyzer that combines results from multiple lexicons
  return {
    analyze: (text) => {
      try {
        // Apply fallback for empty/invalid text
        if (!text || typeof text !== 'string') {
          return {
            score: 0,
            comparative: 0,
            positive: [], 
            negative: [], 
            words: [], 
            multiLexicon: {
              standard: { score: 0, comparative: 0, positive: [], negative: [] },
              afinn: { score: 0, comparative: 0, positive: [], negative: [] },
              custom: { score: 0, comparative: 0, positive: [], negative: [] },
              nlpjs: { score: 0, comparative: 0, positive: [], negative: [] },
              combinedScore: 0,
              combinedComparative: 0
            }
          };
        }
        
        // Process whole text with each analyzer
        let standardResult, afinnResult, customResult, nlpjsResult;
        
        try {
          standardResult = standardAnalyzer.analyze(text);
        } catch (err) {
          console.error('Error in standard sentiment analyzer:', err);
          standardResult = { score: 0, comparative: 0, positive: [], negative: [], words: [] };
        }
        
        try {
          afinnResult = afinnAnalyzer(text);
        } catch (err) {
          console.error('Error in AFINN analyzer:', err);
          afinnResult = { score: 0, comparative: 0, positive: [], negative: [], type: 'afinn' };
        }
        
        try {
          customResult = customAnalyzer(text);
        } catch (err) {
          console.error('Error in custom analyzer:', err);
          customResult = { score: 0, comparative: 0, positive: [], negative: [], type: 'custom' };
        }
        
        try {
          nlpjsResult = nlpjsAnalyzer.analyze(text);
        } catch (err) {
          console.error('Error in nlp.js analyzer:', err);
          nlpjsResult = { score: 0, comparative: 0, positive: [], negative: [], type: 'nlpjs' };
        }
        
        // Combine all unique positive and negative words
        const allPositive = Array.from(new Set([
          ...standardResult.positive,
          ...afinnResult.positive,
          ...customResult.positive,
          ...nlpjsResult.positive
        ]));
        
        const allNegative = Array.from(new Set([
          ...standardResult.negative,
          ...afinnResult.negative,
          ...customResult.negative,
          ...nlpjsResult.negative
        ]));
        
        // Weighted average of scores - updated with potentially different weights
        const nlpjsWeight = nlpjsResult.type === 'fallback' ? 0.1 : 0.2;
        const standardWeight = 0.4;
        const afinnWeight = 0.3;
        const customWeight = nlpjsResult.type === 'fallback' ? 0.2 : 0.1;
        
        const weightedScore = (
          standardResult.score * standardWeight + 
          afinnResult.score * afinnWeight + 
          customResult.score * customWeight +
          nlpjsResult.score * nlpjsWeight
        );
        
        return {
          // Standard result (for compatibility)
          ...standardResult,
          
          // Enhanced result with multiple lexicons
          multiLexicon: {
            standard: standardResult,
            afinn: afinnResult,
            custom: customResult,
            nlpjs: nlpjsResult,
            
            // Combined score (weighted average)
            combinedScore: weightedScore,
            combinedComparative: text.split(/\s+/).length > 0 
              ? weightedScore / text.split(/\s+/).length 
              : 0
          },
          
          // Override with enhanced data
          score: weightedScore,
          // Override with combined unique words
          positive: allPositive,
          negative: allNegative
        };
      } catch (err) {
        console.error('Error in multi-lexicon analyzer:', err);
        // Return a safe default object
        return {
          score: 0,
          comparative: 0,
          positive: [], 
          negative: [], 
          words: [], 
          multiLexicon: {
            standard: { score: 0, comparative: 0, positive: [], negative: [] },
            afinn: { score: 0, comparative: 0, positive: [], negative: [] },
            custom: { score: 0, comparative: 0, positive: [], negative: [] },
            nlpjs: { score: 0, comparative: 0, positive: [], negative: [] },
            combinedScore: 0,
            combinedComparative: 0
          }
        };
      }
    }
  };
};

const useTextAnalysis = (data) => {
  const [wordFrequencyData, setWordFrequencyData] = useState([]);
  const [sentimentData, setSentimentData] = useState({ items: [], overall: {} });
  const [relationshipData, setRelationshipData] = useState({ nodes: [], links: [] });
  const [concordanceData, setConcordanceData] = useState([]);
  const [ttrData, setTtrData] = useState({ ttr: 0, uniqueWords: 0, totalWords: 0 });
  const [topicModelData, setTopicModelData] = useState([]);
  const [overviewData, setOverviewData] = useState(null);
  const [phraseLinkData, setPhraseLinkData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(false);

  const allText = useMemo(() => {
    if (!data || data.length === 0) return '';
    return data.map(item => item.processingResult || item.content || '').join(' ');
  }, [data]);

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
      .slice(0, 50);

    return sortedWords;
  }, [stopWords]);

  const calculateSentimentAnalysis = useCallback((textData) => {
    const sentimentAnalyzer = createMultiLexiconAnalyzer();
    
    // Log data from one text to check each lexicon
    if (textData && textData.length > 0) {
      const sampleText = textData[0].processingResult || textData[0].content || '';
      if (sampleText) {
        const sampleResult = sentimentAnalyzer.analyze(sampleText);
        console.log('Sentiment analysis sample results:', {
          standard: sampleResult.multiLexicon.standard.score,
          afinn: sampleResult.multiLexicon.afinn.score,
          custom: sampleResult.multiLexicon.custom.score,
          nlpjs: sampleResult.multiLexicon.nlpjs.score,
          combined: sampleResult.score
        });
      }
    }
    
    // Process each text in full
    const sentiments = textData.map(item => {
      const text = item.processingResult || item.content || '';
      const date = item.timestamp ? new Date(item.timestamp) : new Date();
      
      // Analyze the complete text, not just a portion
      const result = sentimentAnalyzer.analyze(text);
      const { score, comparative, positive, negative, multiLexicon } = result;

      const emotionProfile = {
        positive: positive.length > 0,
        negative: negative.length > 0,
        intensity: Math.abs(comparative)
      };

      return {
        id: item.id,
        date: date.toISOString().split('T')[0],
        sentiment: score,
        comparative: comparative,
        positiveWords: positive,
        negativeWords: negative,
        title: truncateText(text, 50),
        emotionWords: [...positive, ...negative],
        textLength: text.length,
        lexicons: multiLexicon,
        emotionProfile
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

    const sentimentVolatility = sentiments.length > 1 
      ? Math.sqrt(sentiments.reduce((sum, item) => sum + Math.pow(item.sentiment - avgSentiment, 2), 0) / sentiments.length)
      : 0;

    const processedSentiment = {
      items: sentiments,
      overall: {
        average: avgSentiment,
        total: totalSentiment,
        topPositive,
        topNegative,
        positiveCount: allPositiveWords.length,
        negativeCount: allNegativeWords.length,
        volatility: sentimentVolatility,
        lexiconAverages: {
          standard: sentiments.reduce((sum, item) => sum + (item.lexicons?.standard?.score || 0), 0) / sentiments.length,
          afinn: sentiments.reduce((sum, item) => sum + (item.lexicons?.afinn?.score || 0), 0) / sentiments.length,
          custom: sentiments.reduce((sum, item) => sum + (item.lexicons?.custom?.score || 0), 0) / sentiments.length,
          nlpjs: sentiments.reduce((sum, item) => sum + (item.lexicons?.nlpjs?.score || 0), 0) / sentiments.length
        }
      }
    };
    return processedSentiment;
  }, []);

  const calculateRelationships = useCallback((textData) => {
    const nodes = textData.map((item, index) => ({
      id: item.id || index.toString(),
      name: item.originalName || `Text ${index + 1}`,
      val: 1 + (item.processingResult || item.content || '').length / 1000,
      words: new Set(
        (item.processingResult || item.content || '')
          .toLowerCase()
          .split(/\s+/)
          .map(cleanWord)
          .filter(word => word.length > 2 && !stopWords.has(word))
      )
    }));

    const links = [];
    const minSharedWords = 3;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];

        const intersection = new Set([...node1.words].filter(word => node2.words.has(word)));
        const sharedWordCount = intersection.size;

        if (sharedWordCount >= minSharedWords) {
          links.push({
            source: node1.id,
            target: node2.id,
            value: sharedWordCount
          });
        }
      }
    }

    const finalNodes = nodes.map(({ words, ...rest }) => rest);

    return { nodes: finalNodes, links };
  }, [stopWords]);

  const calculateConcordance = useCallback((textToSearch, term) => {
    if (!term || term.trim() === '' || !textToSearch) {
      return [];
    }

    const searchTermLower = term.toLowerCase();
    const words = textToSearch.split(/\s+/);
    const contextWindow = 7;
    const results = [];

    words.forEach((word, i) => {
      const cleaned = cleanWord(word);

      if (cleaned === searchTermLower) {
        const startIdx = Math.max(0, i - contextWindow);
        const endIdx = Math.min(words.length, i + contextWindow + 1);

        const contextWords = words.slice(startIdx, endIdx);

        results.push({
          position: i,
          highlightedContext: contextWords
            .map((w, idx) => (startIdx + idx === i ? `<mark>${w}</mark>` : w))
            .join(' ')
        });
      }
    });
    return results;
  }, []);

  const calculateTTR = useCallback((textToCalc) => {
    if (!textToCalc || textToCalc.trim() === '') {
       return { ttr: 0, uniqueWords: 0, totalWords: 0 };
    }

    const words = textToCalc.toLowerCase()
                      .split(/\s+/)
                      .filter(word => word.length > 0)
                      .map(cleanWord);

    const totalWords = words.length;
    const uniqueWords = new Set(words).size;
    const ttr = totalWords > 0 ? uniqueWords / totalWords : 0;

    const processedTTR = { ttr, uniqueWords, totalWords };
    return processedTTR;
  }, []);

  const calculateTopicModeling = useCallback((textToModel) => {
    if (!textToModel || textToModel.trim() === '') {
        return [];
    }
    const sentences = textToModel.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const cooccurrences = {};

    sentences.forEach(sentence => {
      const words = sentence.toLowerCase()
                           .split(/\s+/)
                           .map(cleanWord)
                           .filter(word => word.length > 2 && !stopWords.has(word));

      const uniqueWordsInSentence = Array.from(new Set(words));

      for (let i = 0; i < uniqueWordsInSentence.length; i++) {
        const word1 = uniqueWordsInSentence[i];
        if (!cooccurrences[word1]) cooccurrences[word1] = {};

        for (let j = i + 1; j < uniqueWordsInSentence.length; j++) {
          const word2 = uniqueWordsInSentence[j];
          cooccurrences[word1][word2] = (cooccurrences[word1][word2] || 0) + 1;
          if (!cooccurrences[word2]) cooccurrences[word2] = {};
          cooccurrences[word2][word1] = (cooccurrences[word2][word1] || 0) + 1;
        }
      }
    });

    const wordFrequency = Object.entries(cooccurrences).reduce((acc, [word, related]) => {
        acc[word] = Object.values(related).reduce((sum, count) => sum + count, 0);
        return acc;
    }, {});

    const sortedWords = Object.keys(wordFrequency)
                              .sort((a, b) => wordFrequency[b] - wordFrequency[a]);

    const topics = [];
    const processedWords = new Set();
    const maxTopics = 12;
    const relatedWordsCount = 5;

    for (const word of sortedWords) {
      if (processedWords.has(word) || !cooccurrences[word]) continue;

      const relatedWords = Object.keys(cooccurrences[word])
                                .sort((a, b) => cooccurrences[word][b] - cooccurrences[word][a])
                                .slice(0, relatedWordsCount);

      if (relatedWords.length > 0) {
        topics.push({
          mainWord: word,
          relatedWords,
          strength: wordFrequency[word]
        });

        processedWords.add(word);
      }

      if (topics.length >= maxTopics) break;
    }

    const maxStrength = topics[0]?.strength || 1;
    const finalTopics = topics.map(topic => ({
        ...topic,
        normalizedStrength: topic.strength / maxStrength
    }));

    return finalTopics;
  }, [stopWords]);

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
    const { totalWords, ttr: vocabularyDensity } = calculatedTtrData;

    const sentenceTokenizer = new natural.SentenceTokenizer();
    const sentences = sentenceTokenizer.tokenize(combinedText);
    const totalSentences = sentences.length > 0 ? sentences.length : 1;
    const avgWordsPerSentence = totalWords / totalSentences;

    let readabilityIndex = null;
    if (totalWords > 0 && totalSentences > 0) {
        try {
            const totalCharacters = combinedText.length;

            const counts = {
                sentence: totalSentences,
                word: totalWords,
                character: totalCharacters
            };

            readabilityIndex = automatedReadability(counts);

        } catch (e) {
            console.error("Error calculating automated readability:", e);
            readabilityIndex = null;
        }
    }

    const wordTokenizer = new natural.WordTokenizer();
    const words = wordTokenizer.tokenize(combinedText.toLowerCase())
                               .filter(word => word.length > 1 && !stopWords.has(word));
    const bigrams = natural.NGrams.bigrams(words);
    const phraseCounts = bigrams.reduce((acc, phraseArr) => {
        const phrase = phraseArr.join(' ');
        acc[phrase] = (acc[phrase] || 0) + 1;
        return acc;
    }, {});
    const significantPhrases = Object.entries(phraseCounts).filter(([phrase, count]) => count > 1);
    const totalPhrases = significantPhrases.length;

    const phraseNodes = significantPhrases.slice(0, 50).map(([phrase, count]) => ({
        id: phrase,
        name: phrase,
        val: count
    }));

    const phraseLinks = [];
    const nodeMap = new Map(phraseNodes.map(node => [node.id, node]));

    for (let i = 0; i < phraseNodes.length; i++) {
        const node1 = phraseNodes[i];
        const words1 = new Set(node1.id.split(' '));

        for (let j = i + 1; j < phraseNodes.length; j++) {
            const node2 = phraseNodes[j];
            const words2 = node2.id.split(' ');

            if (words2.some(w => words1.has(w))) {
                 phraseLinks.push({
                     source: node1.id,
                     target: node2.id,
                     value: (node1.val + node2.val) / 2
                 });
            }
        }
    }

    return {
      totalWords,
      totalPhrases,
      totalTexts,
      vocabularyDensity,
      readabilityIndex,
      avgWordsPerSentence,
      phraseGraphData: { nodes: phraseNodes, links: phraseLinks }
    };
  }, [stopWords]);

  const calculateSyuzhetSentiment = useCallback((text, chunkCount = 20) => {
    if (!text || text.trim() === '') return { sentenceScores: [], chunkedMeans: [] };
    const sentenceTokenizer = new natural.SentenceTokenizer();
    const sentimentAnalyzer = createMultiLexiconAnalyzer();
    const sentences = sentenceTokenizer.tokenize(text);
    
    const sentenceScores = sentences.map(sentence => {
      const result = sentimentAnalyzer.analyze(sentence);
      return {
        sentence,
        score: result.score,
        positive: result.positive,
        negative: result.negative,
        lexicons: result.multiLexicon
      };
    });
    
    const chunkSize = Math.ceil(sentences.length / chunkCount);
    const chunkedMeans = [];
    for (let i = 0; i < sentences.length; i += chunkSize) {
      const chunk = sentenceScores.slice(i, i + chunkSize);
      const mean = chunk.length > 0 ? chunk.reduce((acc, s) => acc + s.score, 0) / chunk.length : 0;
      chunkedMeans.push(mean);
    }
    
    const lexiconTrajectories = {
      standard: Array(chunkCount).fill(0),
      afinn: Array(chunkCount).fill(0),
      custom: Array(chunkCount).fill(0),
      nlpjs: Array(chunkCount).fill(0)
    };
    
    for (let i = 0; i < sentences.length; i += chunkSize) {
      const chunk = sentenceScores.slice(i, i + chunkSize);
      const chunkIndex = Math.floor(i / chunkSize);
      
      if (chunk.length > 0) {
        lexiconTrajectories.standard[chunkIndex] = chunk.reduce((acc, s) => acc + (s.lexicons?.standard?.score || 0), 0) / chunk.length;
        lexiconTrajectories.afinn[chunkIndex] = chunk.reduce((acc, s) => acc + (s.lexicons?.afinn?.score || 0), 0) / chunk.length;
        lexiconTrajectories.custom[chunkIndex] = chunk.reduce((acc, s) => acc + (s.lexicons?.custom?.score || 0), 0) / chunk.length;
        lexiconTrajectories.nlpjs[chunkIndex] = chunk.reduce((acc, s) => acc + (s.lexicons?.nlpjs?.score || 0), 0) / chunk.length;
      }
    }
    
    return { 
      sentenceScores, 
      chunkedMeans, 
      lexiconTrajectories 
    };
  }, []);

  // Memoize syuzhetSentiment result to avoid recalculation
  const syuzhetSentiment = useMemo(() => {
    if (!allText) return { sentenceScores: [], chunkedMeans: [], lexiconTrajectories: {} };
    return calculateSyuzhetSentiment(allText);
  }, [allText, calculateSyuzhetSentiment]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setWordFrequencyData([]);
      setSentimentData({ items: [], overall: {} });
      setRelationshipData({ nodes: [], links: [] });
      setConcordanceData([]);
      setTtrData({ ttr: 0, uniqueWords: 0, totalWords: 0 });
      setTopicModelData([]);
      setOverviewData(null);
      setPhraseLinkData({ nodes: [], links: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const frequency = calculateWordFrequency(data);
      const sentiment = calculateSentimentAnalysis(data);
      const relationships = calculateRelationships(data);
      const ttr = calculateTTR(allText);
      const topics = calculateTopicModeling(allText);
      const summary = calculateOverviewSummary(data, allText, ttr);
      const initialConcordance = calculateConcordance(allText, '');

      setWordFrequencyData(frequency);
      setSentimentData(sentiment);
      setRelationshipData(relationships);
      setTtrData(ttr);
      setTopicModelData(topics);
      setOverviewData(summary);
      setPhraseLinkData(summary.phraseGraphData);
      setConcordanceData(initialConcordance);

    } catch (error) {
        console.error("Error during initial text analysis processing:", error);
    } finally {
        setIsLoading(false);
    }
  }, [data, allText, calculateWordFrequency, calculateSentimentAnalysis, calculateRelationships, calculateConcordance, calculateTTR, calculateTopicModeling, calculateOverviewSummary]);

  const searchConcordance = useCallback((term) => {
     if (!allText) return;
     const results = calculateConcordance(allText, term);
     setConcordanceData(results);
  }, [allText, calculateConcordance]);

  return {
    overviewData,
    wordFrequencyData,
    sentimentData,
    relationshipData,
    concordanceData,
    ttrData,
    topicModelData,
    phraseLinkData,
    isLoading,
    searchConcordance,
    syuzhetSentiment, // Ensure this is included
  };
};

export default useTextAnalysis;
