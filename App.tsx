/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { TextInput, Button, Text, View, ScrollView } from 'react-native';
import { processImage, processAudio, processVideo, processText } from './src/services/multimediaProcessor';
import DataVisualization from './src/components/DataVisualization';
import { createTable, exportToCSV } from './src/services/database';

function App(): React.JSX.Element {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');

  const handleProcessText = async () => {
    const processedText = await processText(inputText);
    setResult(processedText);
  };

  const handleProcessImage = async () => {
    await processImage();
  };

  const handleProcessAudio = async () => {
    await processAudio();
  };

  const handleProcessVideo = async () => {
    await processVideo();
  };

  const handleExportToCSV = async () => {
    await createTable();
    const csv = await exportToCSV();
    console.log('CSV data:', csv);
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: 200 }}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter text"
        />
        <Button title="Process Text" onPress={handleProcessText} />
        <Button title="Process Image" onPress={handleProcessImage} />
        <Button title="Process Audio" onPress={handleProcessAudio} />
        <Button title="Process Video" onPress={handleProcessVideo} />
        <Button title="Export to CSV" onPress={handleExportToCSV} />
        <Text>{result}</Text>
        <DataVisualization chartType="line" />
      </View>
    </ScrollView>
  );
}

export default App;
