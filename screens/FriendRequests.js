import { View, Text, Image, Pressable, Touchable, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useLayoutEffect, useContext } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppContext } from '../context/AppContext'
const FriendRequests = ({ navigation }) => {
    const { user, friendRequests, fetchFriendRequests } = useContext(AppContext);
    const checkKey = async () => {
        let token = await AsyncStorage.getItem('authToken');
        if (token == null) {
            navigation.navigate('Login');
            return;
        }
        fetchFriendRequests();
    }
    useLayoutEffect(() => {
        checkKey();
    }, [navigation])


    return (
        <SafeAreaView className="flex flex-1 bg-gray-800 px-2">
            <View className="flex items-center justify-center p-5">
                {
                    friendRequests?.length > 0 ?
                        <Text className="text-green-500 text-xl">You have ({friendRequests.length}) Requests!</Text>
                        :
                        <Text className="text-red-400 text-xl">You don't have any Requests!</Text>
                }
            </View>
            <ScrollView showsVerticalScrollIndicator={false} className="flex flex-1 flex-col">
                {
                    friendRequests.map((item, index) => {
                        return <SingleFriendRequestComponent key={index} item={item} />
                    })
                }
            </ScrollView>
        </SafeAreaView>
    )
}

const SingleFriendRequestComponent = ({ item }) => {

    const { acceptFriendRequest } = useContext(AppContext);


    return (
        <View className="flex h-16 items-center flex-row justify-between px-1">
            <View className="flex flex-row items-center justify-start">
                <Image
                    className="h-12 w-12 rounded-full"
                    source={{ uri: axios.defaults.baseURL + item?.image }}
                />
                <View className="pl-3 items-start justify-between gap-y-1">
                    <Text className="text-white text-base font-semibold">{item?.name}</Text>
                    <Text className="text-gray-400 text-sm">Sent you a Friend Request!</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={() => { acceptFriendRequest(item._id) }}
                className="rounded-lg bg-green-300 h-8 w-16 items-center justify-center"
            >
                <Text className="text-sm font-semibold text-black">Accept</Text>
            </TouchableOpacity>
        </View>

    )
}

export default FriendRequests