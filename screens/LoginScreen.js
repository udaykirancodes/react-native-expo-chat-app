import { View, Text, KeyboardAvoidingView, SafeAreaView, TextInput, Pressable, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContext';
import SocketContext from '../context/SocketContext';
import { io } from 'socket.io-client';
const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { setUser } = useContext(AppContext);
    const { socket } = useContext(SocketContext);
    const saveToken = async (token) => {
        try {
            await AsyncStorage.setItem('authToken', token);
        } catch (error) {
            await AsyncStorage.removeItem('authToken');
        }
    }
    const saveUser = async (user) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            await AsyncStorage.removeItem('authToken');
        }
    }

    useEffect(() => {
        setLoading(false);
        setPassword('');
        setEmail('');
    }, [])

    const loginFunction = async () => {
        setLoading(true);
        try {
            let headers = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
            let { data } = await axios.post('/auth/login', {
                email, password
            }, { validateStatus: false }, headers)
            console.log(data)
            if (data.success) {
                socket.emit('addUser', data.user._id);
                saveToken(data.authToken);
                saveUser(data.user);
                setUser(data.user);
                navigation.navigate('Home');
            }
            else {
                Alert.alert(data.msg || "Error Occured");
            }
        } catch (error) {
            console.log(error.message);
        }
        setLoading(false);
    }

    return (
        <SafeAreaView className="flex flex-1">
            <KeyboardAvoidingView className="flex flex-1">
                <View className="bg-gray-900 flex justify-center flex-1 px-3 pb-20">
                    <View className="flex gap-y-4 justify-center items-center">
                        <View className="w-full flex gap-4">
                            <Text className="text-center text-3xl font-extrabold text-white ">Sign In</Text>
                            <Text className="text-center text-xl font-thin text-gray-100 ">Welcome to UdayKiran</Text>
                        </View>
                        <View className="w-full h-12">
                            <TextInput
                                value={email}
                                onChangeText={(text) => setEmail(text)}
                                className="bg-red-100 rounded-md h-full pl-3 text-md text-gray-900"
                                placeholder='Enter Email'
                            />
                        </View>
                        <View className="w-full h-12">
                            <TextInput
                                value={password}
                                onChangeText={(text) => setPassword(text)}
                                secureTextEntry={true}
                                className="bg-red-100 h-full w-full rounded-md  pl-3 text-md text-gray-900"
                                placeholder='Enter Password'
                            />
                        </View>
                        <TouchableOpacity onPress={loginFunction} className="w-full h-12">
                            <View className="h-full bg-blue-400 w-full rounded-md text-center items-center justify-center">
                                <Text className="text-center text-xl text-white">{loading ? "Loading..." : "Sign In"}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Pressable onPress={() => navigation.replace('Register')} className="flex my-6">
                        <Text className="text-slate-500 text-center">Not Registered ? Sign Up</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default LoginScreen