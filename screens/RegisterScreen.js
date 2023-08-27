import { View, Text, Alert, KeyboardAvoidingView, SafeAreaView, TextInput, Pressable, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContext';
import SocketContext from '../context/SocketContext';
const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
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
        setName('');
        setPassword('');
        setEmail('');
    }, [])

    const registerFunction = async () => {
        setLoading(true);
        let headers = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
        try {
            let { data } = await axios.post('/auth/register', {
                email, password, name
            }, { validateStatus: false })
            console.log(data);
            if (data.success) {
                saveToken(data.authToken);
                saveUser(data.user);
                setUser(data.user);
                socket.emit('addUser', data.user._id);
                navigation.navigate('Home');
            }
        } catch (error) {
            console.log(error.message);
        }
        setLoading(false);
    }

    return (
        <KeyboardAvoidingView className="flex flex-1">
            <SafeAreaView className="flex flex-1">
                <View className="bg-gray-900 flex justify-center flex-1 px-3">
                    <View className="flex gap-y-4 justify-center items-center">
                        <View className="w-full flex gap-4">
                            <Text className="text-center text-3xl font-extrabold text-white ">Sign Up</Text>
                            <Text className="text-center text-xl font-thin text-gray-100 ">Welcome to UdayKiran</Text>
                        </View>
                        <View className="w-full h-12">
                            <TextInput
                                className="bg-red-100 rounded-md h-full pl-3 text-md text-gray-900"
                                placeholder='Enter Name'
                                autoCapitalize={false}
                                onChangeText={(text) => setName(text)}
                                value={name}
                            />
                        </View>
                        <View className="w-full h-12">
                            <TextInput
                                autoCapitalize={false}
                                onChangeText={(text) => setEmail(text)}
                                value={email}
                                className="bg-red-100 rounded-md h-full pl-3 text-md text-gray-900"
                                placeholder='Enter Email'
                            />
                        </View>
                        <View className="w-full h-12">
                            <TextInput
                                autoCapitalize={false}
                                onChangeText={(text) => setPassword(text)}
                                value={password}
                                secureTextEntry={true}
                                className="bg-red-100 h-full w-full rounded-md  pl-3 text-md text-gray-900"
                                placeholder='Enter Password'
                            />
                        </View>
                        <TouchableOpacity onPress={registerFunction} className="w-full h-12">
                            <View className="h-full bg-blue-400 w-full rounded-md text-center items-center justify-center">
                                <Text className="text-center text-xl text-white">
                                    {/* {
                                        loading ? "Loading.." : "Register"
                                    } */}
                                    Register
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Pressable onPress={() => navigation.replace('Login')} className="flex my-6">
                        <Text className="text-slate-500 text-center">Already Registered ? Sign In</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}

export default RegisterScreen