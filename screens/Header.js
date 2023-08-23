import { View, Text, Image } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Header = () => {
    const { user, setUser } = useContext(AppContext)
    const getUser = async () => {
        try {
            let us = await AsyncStorage.getItem('user');
            if (!us) {
                return;
            }
            setUser(JSON.parse(us));
        } catch (error) {

        }
    }
    useEffect(() => {
        getUser();
    }, [])
    return (
        <View className="flex items-start justify-center bg-gray-900 p-4">
            <View className="flex-row">
                <Image
                    className="h-9 w-9 rounded-full"
                    source={{ uri: axios.defaults.baseURL + user?.image }}
                />
                <View className="pl-3 items-start justify-between">
                    <Text className="text-white text-sm font-semibold">{user?.name + ' '}(You)</Text>
                    <Text className="text-gray-400 text-xs">{user?.email}</Text>
                </View>
            </View>
        </View>
    )
}

export default Header