import { View, Text, TextInput, Image, KeyboardAvoidingView, ScrollView, Button, Pressable, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState, useCallback, useContext } from 'react'
import * as DocumentPicker from 'expo-document-picker';
import { AntDesign } from '@expo/vector-icons';
import img from "../assets/default.png"
import Header from './Header'
import { Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SocketContext from '../context/SocketContext';
const Profile = ({ navigation }) => {
    const { user, setUser } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(user?.name);
    let socket = useContext(SocketContext);
    useEffect(() => {
        setName(user.name);
    }, [])
    const checkKey = async () => {
        try {
            let token = await AsyncStorage.getItem('authToken');
            if (!token) {
                navigation.navigate('Login');
                return;
            }

        } catch (error) {
            console.log('Error Occured At Profile :- ' + error.message);
        }
    }
    const LogOut = async () => {
        try {
            socket.emit('removeUser', user?._id);
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('authToken');
            navigation.replace('Login')
        } catch (error) {
            console.log('Error Occured At Profile :- ' + error.message);
        }
    }
    useEffect(() => {
        checkKey();
        setName(user.name);
    }, [])
    const [fileResponse, setFileResponse] = useState(null);
    // useEffect(() => console.log(fileResponse), [])
    const handleDocumentSelection = useCallback(async () => {
        try {
            const response = await DocumentPicker.getDocumentAsync();
            if (response.assets.length && response.assets[0].mimeType.startsWith('image')) {
                setFileResponse(response.assets[0]);
            }
        } catch (err) {
            Alert.alert("Please Select an Image");
        }
    }, []);
    const handleSubmit = async () => {
        setLoading(true);
        try {
            let token = await AsyncStorage.getItem('authToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            setName(name.trim());
            if (!name) {
                return;
            }
            let options = {
                method: 'POST',
                url: '/update-profile',
                data: {
                    name: name
                },
                headers: {
                    'authToken': token
                },
            }
            let { data } = await axios(options);
            if (data.success) {
                // do stuff
                let tempUser = user;
                tempUser.name = name;
                setUser(tempUser);
                await AsyncStorage.setItem('user', JSON.stringify(user));
            }
            setLoading(false);
        } catch (error) {
            console.log('Error Occured ' + error)
        }
        setLoading(false);
    }
    return (
        <KeyboardAvoidingView className="flex flex-1 bg-gray-800">
            <Header />
            <View className="flex items-center justify-center py-10 px-2">
                <Pressable
                    onPress={handleDocumentSelection}
                    className="flex items-end">
                    <Image
                        source={fileResponse ? fileResponse : { uri: axios.defaults.baseURL + user?.image }}
                        className="h-24 w-24 rounded-full"
                    />
                    <AntDesign name="pluscircle" size={24} color="gray" />
                </Pressable>
                <Text className="text-center font-semibold text-gray-400 mt-3 text-base">{user?.email}</Text>
            </View>
            <View style={{ height: Dimensions.get('window').height - 100 }}>
                <ScrollView className="gap-y-4 px-2">
                    <View>
                        <TextInput
                            value={name}
                            onChangeText={(text) => setName(text)}
                            className="bg-gray-200 px-2 rounded-md h-12 text-base"
                            placeholder='Name'
                        />
                    </View>
                    {/* <View>
                    <TextInput
                        className="bg-gray-200 px-2 rounded-md h-12 text-base"
                        placeholder='Name'
                    />
                </View> */}
                    <View>
                        <TouchableOpacity
                            className="bg-purple-400 h-12 items-center justify-center  px-2 rounded-md text-base"
                            onPress={handleSubmit}
                        >
                            <Text className="font-semibold uppercase text-white text-base">{loading ? "Loading..." : "Save Profile"}</Text>
                        </TouchableOpacity>

                    </View>
                    <View>
                        <TouchableOpacity
                            className=" bg-red-400 mt-20 h-12 items-center justify-center  px-2 rounded-md text-base"
                            onPress={LogOut}
                        >
                            <Text className="font-semibold uppercase text-white text-base">Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    )
}

export default Profile