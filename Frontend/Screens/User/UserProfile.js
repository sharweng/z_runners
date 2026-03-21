import React, { useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { Container } from "native-base"
import { useFocusEffect, useNavigation } from "@react-navigation/native"

import AsyncStorage from '@react-native-async-storage/async-storage'

import axios from "axios"
import baseURL from "../../constants/baseurl"
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import AuthGlobal from "../../Context/Store/AuthGlobal"
import { logoutUser } from "../../Context/Actions/Auth.actions"
import Input from '../../Shared/Input';
import { colors, radius, shadow, spacing } from "../../Shared/theme";
const countries = require("../../data/countries.json");

const normalizeCountryValue = (value) => {
    if (!value) {
        return '';
    }

    const input = String(value).trim().toLowerCase();
    const byCode = countries.find((item) => item.code.toLowerCase() === input);
    if (byCode) {
        return byCode.code;
    }

    const byName = countries.find((item) => item.name.toLowerCase() === input);
    return byName ? byName.code : '';
};


const UserProfile = (props) => {
    const context = useContext(AuthGlobal)
    const [userProfile, setUserProfile] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [street, setStreet] = useState('')
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')
    const [password, setPassword] = useState('')
    const [image, setImage] = useState('')
    const [saving, setSaving] = useState(false)
    const navigation = useNavigation()

    useEffect(() => {
        (async () => {
            await ImagePicker.requestCameraPermissionsAsync();
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        })();
    }, [])

    useEffect(() => {
        if (!userProfile) {
            return;
        }

        setName(userProfile.name || '');
        setEmail(userProfile.email || '');
        setPhone(userProfile.phone || '');
        setStreet(userProfile.street || '');
        setCity(userProfile.city || '');
        setCountry(normalizeCountryValue(userProfile.country));
        setImage(userProfile.image || '');
    }, [userProfile])

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }

    const updateProfile = async () => {
        if (!name || !email || !phone || !country) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Missing required fields',
                text2: 'Name, email, phone, and country are required.',
            });
            return;
        }

        try {
            setSaving(true);
            const token = await AsyncStorage.getItem('jwt');
            const userId = context?.stateUser?.user?.userId;

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('street', street);
            formData.append('city', city);
            formData.append('country', country);

            if (password && password.trim() !== '') {
                formData.append('password', password);
            }

            const isLocalImage = image && (image.startsWith('file://') || image.startsWith('content://'));
            if (isLocalImage) {
                const uploadUri = image.startsWith('file://')
                    ? image
                    : `file:///${image.split('file:/').join('')}`;

                formData.append('image', {
                    uri: uploadUri,
                    type: mime.getType(uploadUri) || 'image/jpeg',
                    name: uploadUri.split('/').pop() || `profile-${Date.now()}.jpg`,
                });
            }

            const res = await axios.put(
                `${baseURL}users/${userId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setUserProfile(res.data);
            setPassword('');
            Toast.show({
                topOffset: 60,
                type: 'success',
                text1: 'Profile updated',
            });
        } catch (error) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Update failed',
                text2: 'Please try again.',
            });
        } finally {
            setSaving(false);
        }
    }

    const handleSignOut = () => {
        AsyncStorage.removeItem("jwt");
        logoutUser(context.dispatch);
    }

    useFocusEffect(
        useCallback(() => {
            if (
                context.stateUser.isAuthenticated === false ||
                context.stateUser.isAuthenticated === null
            ) {
                navigation.navigate("Login")
            }
            // console.log(context.stateUser.user)
            AsyncStorage.getItem("jwt")
                .then((res) => {
                    axios
                        .get(`${baseURL}users/${context.stateUser.user.userId}`, {
                            headers: { Authorization: `Bearer ${res}` },
                        })
                        .then((user) => setUserProfile(user.data))
                })
                .catch((error) => console.log(error))
            return () => {
                setUserProfile();
            }

        }, [context.stateUser.isAuthenticated]))

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.screenTitle}>Edit Profile</Text>

                <View style={styles.card}>
                    <View style={styles.imageContainer}>
                    <Image
                        style={styles.image}
                        source={{ uri: image || 'https://via.placeholder.com/200x200.png?text=Profile' }}
                    />
                    <TouchableOpacity onPress={takePhoto} style={styles.imagePicker}>
                        <Ionicons style={{ color: 'white' }} name="camera" />
                    </TouchableOpacity>
                </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.smallButton, styles.primaryFill]} onPress={takePhoto}>
                            <Text style={styles.smallButtonText}>Take Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.smallButton, styles.secondaryFill]} onPress={pickImage}>
                            <Text style={styles.smallButtonText}>Upload Photo</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Account Details</Text>
                    <Input placeholder="Name" value={name} onChangeText={setName} />
                    <Input placeholder="Email" value={email} onChangeText={(text) => setEmail(text.toLowerCase())} />
                    <Input placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                    <Input placeholder="Street" value={street} onChangeText={setStreet} />
                    <Input placeholder="City" value={city} onChangeText={setCity} />

                    <Text style={styles.fieldLabel}>Country</Text>
                    <View style={styles.pickerWrap}>
                        <Picker
                            mode="dropdown"
                            style={styles.picker}
                            selectedValue={country}
                            onValueChange={(itemValue) => setCountry(itemValue)}
                        >
                            <Picker.Item label="Select country" value="" />
                            {countries.map((c) => (
                                <Picker.Item key={c.code} label={c.name} value={c.code} />
                            ))}
                        </Picker>
                    </View>

                    <Input placeholder="New Password (optional)" value={password} onChangeText={setPassword} secureTextEntry />
                </View>

                <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton, saving && styles.disabledButton]}
                    onPress={updateProfile}
                    disabled={saving}
                >
                    {saving
                        ? <ActivityIndicator color={colors.surface} />
                        : <Text style={styles.actionButtonText}>Save Profile</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut}>
                    <Text style={[styles.actionButtonText, styles.signOutText]}>Sign Out</Text>
                </TouchableOpacity>

                <View style={styles.bottomSpace} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        paddingTop: spacing.xl,
        paddingHorizontal: spacing.lg,
        width: '100%',
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.lg,
    },
    card: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadow,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    imageContainer: {
        alignSelf: 'center',
        width: 180,
        height: 180,
        borderStyle: 'solid',
        borderWidth: 1,
        justifyContent: 'center',
        borderRadius: 90,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        marginBottom: spacing.md,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
    },
    imagePicker: {
        position: 'absolute',
        right: 5,
        bottom: 5,
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 100,
        elevation: 20,
    },
    buttonRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    smallButton: {
        flex: 1,
        borderRadius: radius.pill,
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryFill: {
        backgroundColor: colors.primary,
    },
    secondaryFill: {
        backgroundColor: colors.accent,
    },
    smallButtonText: {
        color: colors.surface,
        fontWeight: '600',
    },
    fieldLabel: {
        width: '100%',
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
        color: colors.text,
        fontWeight: '600',
    },
    pickerWrap: {
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        color: colors.text,
    },
    actionButton: {
        width: '100%',
        borderRadius: radius.pill,
        paddingVertical: spacing.lg,
        alignItems: "center",
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    signOutButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.danger,
    },
    actionButtonText: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: '700',
    },
    signOutText: {
        color: colors.danger,
    },
    disabledButton: {
        opacity: 0.7,
    },
    bottomSpace: {
        height: spacing.xl,
    },
})

export default UserProfile