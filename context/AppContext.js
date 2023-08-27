import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";
import axios from "axios";
const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState({
        _id: '',
        updatedAt: '',
        createdAt: '',
        name: '',
        email: '',
        image: '',
        friends: [],
        sentFriendRequests: [],
        friendRequests: []
    })
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [friendRequests, setFriendRequests] = useState([])
    const [refreshing, setRefreshing] = useState(false);
    // Fetch User
    const fetchUser = async () => {
        try {
            let token = await AsyncStorage.getItem('authToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            let headers = {
                'authToken': token
            }
            let { data } = await axios.get('/my-details', { headers });
            if (data.success) {
                console.log('User Fetched')
                setUser(data.data);
                await AsyncStorage.setItem('user', JSON.stringify(data.data));
            }
        } catch (error) {
            console.log('Error Occured At Friend Req :- ' + error.message);
        }
    }
    // Get All Friend Request
    const fetchFriendRequests = async () => {
        try {
            let token = await AsyncStorage.getItem('authToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            let headers = {
                'authToken': token
            }
            let { data } = await axios.get('/request/friend-requests', { headers });
            setFriendRequests(data.data);
        } catch (error) {
            console.log('Error Occured At Friend Req :- ' + error.message);
        }
    }
    // Accept Friend Request
    const acceptFriendRequest = async (id) => {
        try {
            let token = await AsyncStorage.getItem('authToken');
            if (token == null) {
                navigation.replace('Login');
                return;
            }
            let options = {
                method: 'POST',
                url: '/request/accept-request',
                data: {
                    requestId: id
                },
                headers: {
                    'authToken': token
                },
            }
            let { data } = await axios(options);
            if (data.success) {
                let fr = friendRequests.filter((r) => r._id != id);
                setFriendRequests(fr);
                let tempUser = user;
                tempUser.friendRequests.filter(fr => fr != id);
                setUser(tempUser);
                await AsyncStorage.setItem('user', JSON.stringify(user));
            }
        } catch (error) {
            console.log('Error Occured At Friend Req :- ' + error.message);
        }
    }
    // Send Friend Request
    const sendFriendRequest = async (id) => {
        try {
            let token = await AsyncStorage.getItem('authToken');
            if (token == null) {
                navigation.replace('Login');
                return;
            }
            let options = {
                method: 'POST',
                url: '/request/send-request',
                data: {
                    receiverId: id
                },
                headers: {
                    'authToken': token
                },
            }
            let { data } = await axios(options);
            if (data.success) {
                // do stuff
                await fetchUser();
            }
        } catch (error) {
            console.log('Error Occured At Friend Req :- ' + error.message);
        }
    }
    const fetchConversations = async () => {
        console.log('convo fetching')
        setRefreshing(true);
        try {
            let token = await AsyncStorage.getItem('authToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }
            let headers = {
                'authToken': token
            }
            let { data } = await axios.get('/chat/get-convos', { headers });
            if (data.success) {
                console.log('Conversations : ' + data.data.length);
                setConversations(data.data);
            }
            setRefreshing(false);
        } catch (error) {
            setRefreshing(false);
            console.log('Error Occured At Fetch Convo :- ' + error.message);
        }
        setRefreshing(false);
    }
    return (
        <AppContext.Provider value={{ user, setUser, friendRequests, conversations, setConversations, refreshing, setRefreshing, fetchConversations, setFriendRequests, fetchUser, fetchFriendRequests, acceptFriendRequest, sendFriendRequest, onlineUsers, setOnlineUsers }}>
            {children}
        </AppContext.Provider>
    )
}
export { AppContext, AppContextProvider }