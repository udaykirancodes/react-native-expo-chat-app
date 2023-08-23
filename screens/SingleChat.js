import { View, Text, ScrollView, Platform, TouchableOpacity, Image, KeyboardAvoidingView, TextInput, Pressable } from 'react-native'
import React, { useContext, useEffect, useState, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons';
import { format } from "timeago.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { AntDesign } from '@expo/vector-icons';
import SocketContext from '../context/SocketContext';
const SingleChat = ({ route, navigation }) => {
    const [conversationId, setConversationId] = useState(route.params.convoId);
    const [chatUser, setChatUser] = useState(route.params.chatUser);
    const dim = Dimensions.get('window');
    let socket = useContext(SocketContext);
    const [conversation, setConversation] = useState({});
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, onlineUsers, setOnlineUsers } = useContext(AppContext);

    const [typingState, setTypingState] = useState(false);

    useEffect(() => {
        socket.on('getUsers', (arr) => {
            setOnlineUsers(arr);
        })
        socket.on('getMessage', (message) => {
            setMessages((prev) => [...prev, message])
        })
        socket.on('takeTyping', (d) => {
            setTypingState(true);
            setTimeout(() => {
                setTypingState(false);
            }, 500);
        });
        getConversation();
        return () => {
            socket.off('getMessage');
            socket.off('getUsers');
            socket.off('takeTyping');
        }
    }, [])
    const getConversation = async () => {
        try {
            let token = await AsyncStorage.getItem('authToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            console.log('Convo Id : ' + conversationId);
            let options = {
                method: 'GET',
                url: `/chat/get-messages/${conversationId}`,
                headers: {
                    'authToken': token
                },
            }
            let { data } = await axios(options);
            if (data.success) {
                setMessages(data.data);
                setMsg('');
            }
        } catch (error) {
            console.log('Error Occured At Fetch Convo :- ' + error);
        }
    }
    const sendMessage = async () => {
        if (msg.trim() === "" || loading) return;
        let senderId = user._id;
        let receiverId = chatUser._id;
        let text = msg;
        setLoading(true);
        try {
            let token = await AsyncStorage.getItem('authToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            let options = {
                method: 'POST',
                data: {
                    senderId: user._id,
                    receiverId: chatUser._id,
                    message: msg.trim(),
                    conversationId: conversationId,
                },
                url: `/chat/send-message`,
                headers: {
                    'authToken': token
                },
            }
            let { data } = await axios(options);
            if (data.success) {
                socket.emit("sendMessage", data.data);
                setMessages((prev) => [...prev, data.data])
                setMsg('');
            }
        } catch (error) {
            console.log(error)
            setLoading(false);
        }
        setMsg('');
        setLoading(false);
    }

    const isOnline = onlineUsers.some((usr) => usr.userId === chatUser._id)
    const scrollViewRef = useRef();
    const Typing = (m) => {
        setMsg(m);
        socket.emit('typing', { receiverId: chatUser._id });
    }
    return (
        <KeyboardAvoidingView
            keyboardShouldPersistTaps={true}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="relative flex flex-1 bg-gray-800 pb-14">
            <View className="px-2 py-2 bg-gray-900 flex-row">
                <View className="flex flex-row items-center">
                    <Pressable onPress={() => navigation.goBack()} className="flex-row">
                        <View className="items-center justify-center pr-2">
                            <AntDesign name="arrowleft" size={28} color="white" />
                        </View>
                        <View>
                            <Image className="h-9 w-9 rounded-full mr-2" source={{ uri: axios.defaults.baseURL + chatUser.image }} />
                        </View>
                    </Pressable>
                    <View>
                        <Text className="text-white text-base">{chatUser?.name}</Text>
                        {
                            isOnline ?
                                typingState ?
                                    <Text className="text-green-400 text-xs">{'Typing..'}</Text>
                                    :
                                    <Text className="text-green-400 text-xs">{'Online'}</Text>
                                :
                                <Text className="text-red-400 text-xs">{'Offline'}</Text>
                        }
                    </View>
                </View>
            </View>
            <ScrollView
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: false })}
                className="px-2" showsVerticalScrollIndicator={false}
            >
                {
                    messages.map((single, index) => {
                        if (single.senderId == user._id) {
                            return <View key={index}
                                className="h-auto w-full my-2  items-end justify-end"
                            >
                                <View className="w-72">
                                    <Text numberOfLines={10} multiline={true} className="bg-purple-500 text-base rounded-3xl px-2 py-2 w-auto text-white ml-auto">{single.message}</Text>
                                    <Text className="text-gray-400 mr-0 text-xs text-right">{format(new Date(single.createdAt))}</Text>
                                </View>
                            </View>
                        }
                        return <View key={index}
                            className="h-auto my-2 text-base flex-row items-start justify-start"
                        >
                            <TouchableOpacity>
                                <Image
                                    className="h-6 w-6 rounded-full mr-2"
                                    source={{ uri: axios.defaults.baseURL + chatUser.image }}
                                />
                            </TouchableOpacity>
                            <View className="w-72">
                                <Text numberOfLines={10} multiline={true} className="bg-white relative w-auto px-3 py-2 mr-auto rounded-3xl">{single.message}</Text>
                                <Text className="text-gray-400 mr-0 text-xs text-left">{format(new Date(single.createdAt))}</Text>
                            </View>
                        </View>
                    })
                }
            </ScrollView>
            {/* Message Sending View */}
            <View style={{ width: dim.width }} className="absolute bottom-0 w-full bg-gray-950 flex-grow items-between grid grid-rows-1 grid-cols-2 justify-between flex-row p-2">
                <View>
                    <TextInput
                        className="bg-white h-10 px-2 w-auto rounded-md text-base"
                        multiline={true}
                        value={msg}
                        onChangeText={(txt) => Typing(txt)}
                        style={{ width: dim.width - 100 }}
                        placeholder='Message...'
                    />
                </View>
                {
                    loading ?
                        <TouchableOpacity style={{ width: 70 }} className="bg-purple-100 h-10 w-14 rounded-lg items-center justify-center">
                            <Text className="text-white text-center text-base font-semibold">{loading ? "..." : "Send"}</Text>
                        </TouchableOpacity> :
                        <TouchableOpacity onPress={sendMessage} style={{ width: 70 }} className="bg-purple-500 h-10 w-14 rounded-lg items-center justify-center">
                            <Text className="text-white text-center text-base font-semibold">{loading ? "..." : "Send"}</Text>
                        </TouchableOpacity>
                }
            </View>
        </KeyboardAvoidingView >
    )
}

export default SingleChat