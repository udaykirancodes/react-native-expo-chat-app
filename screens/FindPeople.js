import { View, RefreshControl, Text, SafeAreaView, ScrollView, Image, TextInput, Pressable, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import Header from './Header'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
const FindPeople = ({ navigation }) => {
    const { user, setUser } = useContext(AppContext);
    const [people, setPeople] = useState([]);
    const [search, setSearch] = useState('');
    const checkKey = async () => {
        try {
            let token = await AsyncStorage.getItem('authToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            let headers = {
                'authToken': token
            }
            let { data } = await axios.get('/allusers', { headers });
            setPeople(data.data);
        } catch (error) {
            console.log('Error Occured At Friend Req :- ' + error.message);
        }
    }
    const [refreshing, setRefreshing] = React.useState(false);
    useLayoutEffect(() => {
        checkKey();
    }, [])
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);
    return (
        <>
            <Header />
            <SafeAreaView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing} onRefresh={onRefresh} />
                }
                className="flex flex-1 bg-gray-800 px-2" >
                <View>
                    <TextInput
                        value={search}
                        autoCapitalize='none'
                        onChangeText={(text) => setSearch(text.toLowerCase())}
                        className="flex bg-gray-300 rounded-md px-2 text-lg h-10 my-3"
                        placeholder='Search People'
                    />
                </View>
                <ScrollView showsVerticalScrollIndicator={false} className="flex flex-1 flex-col">
                    {
                        people.map((item, index) => {
                            if (item?.name?.toLowerCase().includes(search) || item?.email?.toLowerCase().includes(search))
                                return <SingleFriendRequestComponent navigation={navigation} item={item} key={index} />
                        })
                    }
                </ScrollView>
            </SafeAreaView >
        </>
    )
}
const SingleFriendRequestComponent = ({ item, navigation }) => {
    const { user, sendFriendRequest } = useContext(AppContext);
    const isFriend = user.friends.includes(item._id);
    const AlredyRequested = user?.sentFriendRequests?.includes(item._id);
    return (
        <View className="flex h-16 items-center flex-row justify-between px-1">
            <View className="flex flex-row items-center justify-start">
                <Image
                    className="h-12 w-12 rounded-full"
                    source={{ uri: axios.defaults.baseURL + item?.image }}
                />
                <View className="pl-3 items-start justify-between gap-y-1">
                    <Text className="text-white text-base font-semibold">{item?.name}</Text>
                    <Text className="text-gray-400 text-sm">{item?.email.length > 20 ? item?.email?.substr(0, 20) + "..." : item?.email}</Text>
                </View>
            </View>
            <View>

                {
                    isFriend ?
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Chats')}
                            className="rounded-lg bg-green-300 h-8 w-16 items-center justify-center"
                        >
                            <Text className="text-sm font-semibold text-black">Chat</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity
                            onPress={() => sendFriendRequest(item._id)}
                            className="rounded-lg bg-blue-300 h-8 w-20 items-center justify-center"
                        >
                            <Text className="text-sm font-semibold text-black">{AlredyRequested ? "Requested" : "Request"}</Text>
                        </TouchableOpacity>
                }
            </View>
        </View>
    )
}
export default FindPeople