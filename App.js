import { StyleSheet, Text, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Tabs from './Tabs/Tabs';
import axios from 'axios';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import SocketContext from './context/SocketContext';
let socket = null;

export default function App() {
  // axios.defaults.baseURL = 'https://expo-chat-app-backend.onrender.com';
  axios.defaults.baseURL = 'http://192.168.1.2:9000';
  axios.defaults.headers = {
    'Content-Type': 'application/json',
  }
  socket = io(axios.defaults.baseURL);
  // useEffect(() => {
  //   return () => {
  //     socket.close();
  //   }
  // }, []);
  return (
    <SocketContext.Provider value={socket}>
      <SafeAreaView className="flex flex-1 bg-gray-800">
        <StatusBar style="dark" />
        <Tabs />
      </SafeAreaView>
    </SocketContext.Provider>

  );
}