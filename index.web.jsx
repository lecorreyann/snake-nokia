import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRegistry } from 'react-native-web';
import App from './App';

// Register the app
AppRegistry.registerComponent('SnakeNokia3310', () => App);

// Run the app
const rootTag = document.getElementById('root');
AppRegistry.runApplication('SnakeNokia3310', { rootTag });
