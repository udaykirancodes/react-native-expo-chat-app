import { View, Text, SafeAreaView, RefreshControl, ScrollView, Image, TextInput, Pressable, Touchable, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useContext, useLayoutEffect } from 'react'
import Header from './Header'
import { AppContext } from '../context/AppContext'
import axios from 'axios';
import SocketContext from '../context/SocketContext';
const Chats = ({ navigation, route }) => {
    const { user } = useContext(AppContext);
    const [search, setSearch] = useState('');
    const { conversations, refreshing, setRefreshing, onlineUsers, setOnlineUsers, setConversations, fetchConversations } = useContext(AppContext);
    let socket = useContext(SocketContext);
    useEffect(() => {
        console.log('useEffect')
        socket.on('connection', () => console.log('+'))
        socket.emit('addUser', user._id);
        socket.on('getUsers', (data) => {
            setOnlineUsers(data);
        })
        fetchConversations();
        return (() => {
            socket.off('connection');
            socket.off('getUsers');
        })
    }, [user._id, route])



    return (
        <>
            <Header />
            <SafeAreaView className="flex flex-1 bg-gray-800 px-2">
                <ScrollView

                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing} onRefresh={() => fetchConversations()} />
                    }

                    showsVerticalScrollIndicator={false} className="flex flex-1 flex-col">
                    <View className="h-32">
                        <Text className="text-xs text-green-400 mt-3">View Online Users!</Text>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="my-2 flex  w-full">
                            {
                                onlineUsers?.map((usr, index) => {
                                    return <SingleOnlineUser onlineUser={usr} key={index} />
                                })
                            }
                        </ScrollView>
                    </View>
                    <View>
                        <TextInput
                            value={search}
                            onChangeText={(text) => setSearch(text)}
                            className="flex bg-gray-300 rounded-md px-2 text-base h-10 my-3"
                            placeholder='Search People'
                        />
                    </View>
                    {
                        conversations.map((item, index) => {
                            return <SingleFriendRequestComponent navigation={navigation} search={search} item={item} key={index} />
                        })
                    }
                </ScrollView>
            </SafeAreaView>
        </>
    )
}

const SingleOnlineUser = ({ onlineUser }) => {
    const [usr, setUsr] = useState({});
    const { user } = useContext(AppContext);
    const fetchUser = async () => {
        try {
            let url = onlineUser.userId;
            let { data } = await axios.get(url);
            if (data.success) {
                if (user._id === data.data._id) {
                    data.data.name = 'You'
                }
                setUsr(data.data);
            }
        } catch (error) {
            console.log('Error Occured At Friend Req :- ' + error.message);
        }
    }
    useEffect(() => {
        fetchUser();
    }, []);
    return (
        <TouchableOpacity className="flex items-center justify-center mr-4">
            <View className="relative">
                <Image source={{ uri: axios.defaults.baseURL + usr.image }} className="h-14 w-14 rounded-full" />
                <View className="bg-green-400 h-3 w-3 absolute right-1 bottom-1 rounded-full"></View>
            </View>

            <Text className="text-white text-xs">{usr.name}</Text>
        </TouchableOpacity>
    )
}
const SingleFriendRequestComponent = ({ search, item, navigation }) => {
    const { user } = useContext(AppContext);
    let cur;
    if (item?.members[0]?._id === user._id) {
        cur = item?.members[1];
    }
    else {
        cur = item?.members[0];
    }
    const openChat = () => {
        navigation.navigate('SingleChat', {
            convoId: item._id,
            chatUser: cur,
        })
    }
    return (
        <TouchableOpacity onPress={openChat} className="relative flex mb-3 items-center flex-row justify-between px-1">
            <View className="flex flex-row items-center justify-start">
                <Image
                    className="h-12 w-12 rounded-full"
                    source={{ uri: axios.defaults.baseURL + cur?.image }}
                />
                <View className="pl-3 items-start justify-between w-full">
                    <Text className="text-white text-base">{cur.name}</Text>
                    {
                        item?.lastMessage ?
                            item?.lastMessage?.seen ?
                                <Text className="text-blue-400 text-base">{item?.lastMessage?.message}</Text>
                                :
                                <Text className="text-blue-400 font-bold text-base">{item?.lastMessage?.message}</Text>
                            :
                            <Text className="text-blue-400 text-base">{'click here & start chatting'}</Text>
                    }
                </View>
                {
                    !item?.lastMessage?.seen &&
                    <View className="absolute right-20 rounded-full bg-white h-2 w-2"></View>
                }
            </View>
        </TouchableOpacity>
    )
}
export default Chats