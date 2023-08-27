import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Image } from 'react-native'
import React, { useEffect, useContext, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
// Icons
import { Ionicons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { EvilIcons } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
// importing screens
import FindPeople from '../screens/FindPeople';
import FriendRequests from '../screens/FriendRequests';
import Chats from "../screens/Chats";
import Profile from "../screens/Profile";
import SingleChat from '../screens/SingleChat';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppContextProvider } from '../context/AppContext';
import Extra from '../screens/Extra';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Bottom Tab
const BottomTabs = () => {
    const Tab = createBottomTabNavigator();
    return (
        <Tab.Navigator
            initialRouteName='Profile'
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#222',
                    padding: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 12
                },
                tabBarActiveTintColor: 'lightgreen',
                tabBarInactiveTintColor: 'gray',
            }}
        >
            <Tab.Screen
                name="Requests"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => focused ? <Ionicons name="notifications-circle" size={24} color="white" /> : <Ionicons name="notifications-circle-outline" size={24} color="white" />
                }}
                component={FriendRequests}
            />
            {/* <Tab.Screen
                name="Extra"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => focused ? <Ionicons name="notifications-circle" size={24} color="white" /> : <Ionicons name="notifications-circle-outline" size={24} color="white" />
                }}
                component={Extra}
            /> */}
            <Tab.Screen
                name="Find"
                options={({ navigation, route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ focused }) => focused ? <Feather name="search" size={24} color="white" /> : <Ionicons name="search" size={24} color="white" />
                })}
                component={FindPeople}
            />
            <Tab.Screen
                name="Chats"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => focused ? <Ionicons name="chatbubbles" size={24} color="white" /> : <Ionicons name="chatbubbles-outline" size={24} color="white" />
                }}
                component={Chats}
            />
            <Tab.Screen
                name="Profile"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => focused ? <FontAwesome name="user-circle" size={24} color="white" /> : <FontAwesome name="user-circle-o" size={24} color="white" />
                }}
                component={Profile}
            />
        </Tab.Navigator >
    )
}
const StackTabs = () => {
    const Stack = createNativeStackNavigator();
    const { chatuser, onlineUsers } = useContext(AppContext);
    return (
        <Stack.Navigator
            initialRouteName='Home'
        >
            <Stack.Screen
                name="Home"
                options={{
                    headerShown: false
                }}
                component={BottomTabs}
            />
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
                name="SingleChat"
                component={SingleChat}
            />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='Login'
                component={LoginScreen}
            />
            <Stack.Screen
                options={{
                    headerShown: false
                }}
                name='Register'
                component={RegisterScreen}
            />
        </Stack.Navigator>
    )
}
let socket;
const Container = () => {
    const { fetchUser, onlineUsers } = useContext(AppContext);
    // socket = io(axios.defaults.baseURL);
    // socket.on('connect', () => console.log('Connected to Socket Server'));
    // socket.emit('addUser', 'Hello');
    useEffect(() => {
        fetchUser();
    }, [])
    return (
        <NavigationContainer>
            <StackTabs />
        </NavigationContainer>
    )
}

const Tabs = () => {
    return (
        <AppContextProvider>
            <Container />
        </AppContextProvider>
    )
}

export default Tabs