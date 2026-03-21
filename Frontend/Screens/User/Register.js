import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from '@react-navigation/native';

import Input from "../../Shared/Input";
// import Error from "../Shared/Error"
import axios from "axios";
import baseURL from "../../constants/baseurl";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import mime from "mime";
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from "expo-image-picker"
import { colors, spacing } from "../../Shared/theme";
const countries = require("../../data/countries.json");

const Register = (props) => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [saving, setSaving] = useState(false);
    const navigation = useNavigation()



    const takePhoto = async () => {
        const c = await ImagePicker.requestCameraPermissionsAsync();

        if (c.status === "granted") {
            let result = await ImagePicker.launchCameraAsync({
                aspect: [4, 3],
                quality: 1,
            });
            console.log("result", result)

            if (!result.canceled) {
                // console.log(result.assets[0].uri)
                setMainImage(result.assets[0].uri);
                setImage(result.assets[0].uri);
            }
        }
    };

    const register = () => {
        console.log(`${baseURL}users/register`)
        if (email === "" || name === "" || phone === "" || password === "" || country === "") {
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Missing required fields",
                text2: "Please complete name, email, phone, password, and country.",
            });
            return;
        }

        if (!image) {
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Profile photo required",
                text2: "Take or upload a photo before registering.",
            });
            return;
        }

        let formData = new FormData();
        const newImageUri = "file:///" + image.split("file:/").join("");


        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("phone", phone);
        formData.append("country", country);
        formData.append("isAdmin", false);
        formData.append("image", {
            uri: newImageUri,
            type: mime.getType(newImageUri),
            name: newImageUri.split("/").pop()
        });
        const config = {
            headers: {
                "Content-Type": "multipart/form-data",

            }
        }
        setSaving(true);
        axios
            .post(`${baseURL}users/register`, formData, config)
            .then((res) => {
                if (res.status === 200) {
                    Toast.show({
                        topOffset: 60,
                        type: "success",
                        text1: "Registration Succeeded",
                        text2: "Please Login into your account",
                    });
                    setTimeout(() => {
                        navigation.navigate("Login");
                    }, 500);
                }
            })
            .catch((error) => {
                // console.log(`${baseURL}users/register`)
                Toast.show({
                    position: 'bottom',
                    bottomOffset: 20,
                    type: "error",
                    text1: "Something went wrong",
                    text2: "Please try again",
                });
                console.log(error)
            })
            .finally(() => setSaving(false))
    }

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        // console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setMainImage(result.assets[0].uri);
        }
    };

    useEffect(() => {
        (async () => {
            await ImagePicker.requestCameraPermissionsAsync();
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        })();
    }, []);
    // console.log(location)
    return (
        <KeyboardAwareScrollView
            viewIsInsideTabBar={true}
            extraHeight={200}
            enableOnAndroid={true}
            contentContainerStyle={styles.contentContainer}
        >
            <Text style={styles.screenTitle}>Create Account</Text>

            <View style={styles.card}>

                <View style={styles.imageContainer}>
                    <Image
                        style={styles.image}
                        source={{ uri: mainImage || 'https://via.placeholder.com/200x200.png?text=Profile' }}
                    />
                    <TouchableOpacity
                        onPress={takePhoto}
                        style={styles.imagePicker}>
                        <Ionicons style={{ color: "white" }} name="camera" />
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
                <Input
                    placeholder={"Email"}
                    name={"email"}
                    id={"email"}
                    onChangeText={(text) => setEmail(text.toLowerCase())}
                />
                <Input
                    placeholder={"Name"}
                    name={"name"}
                    id={"name"}
                    onChangeText={(text) => setName(text)}
                />
                <Input
                    placeholder={"Phone Number"}
                    name={"phone"}
                    id={"phone"}
                    keyboardType={"numeric"}
                    onChangeText={(text) => setPhone(text)}
                />
                <Text style={styles.fieldLabel}>Country</Text>
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
                <Input
                    placeholder={"Password"}
                    name={"password"}
                    id={"password"}
                    secureTextEntry={true}
                    onChangeText={(text) => setPassword(text)}
                />
            </View>

            <TouchableOpacity
                style={[styles.actionButton, styles.registerButton, saving && styles.disabledButton]}
                onPress={register}
                disabled={saving}
            >
                {saving
                    ? <ActivityIndicator color={colors.surface} />
                    : <Text style={styles.actionButtonText}>Register</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.loginButton]} onPress={() => navigation.navigate("Login")}>
                <Text style={[styles.actionButtonText, styles.loginButtonText]}>Back to Login</Text>
            </TouchableOpacity>

            <View style={styles.bottomSpace} />
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        width: "100%",
        paddingTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.accent,
        paddingLeft: spacing.sm,
    },
    card: {
        width: '100%',
        backgroundColor: colors.surface,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 2,
        borderColor: colors.border,
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
        borderStyle: "solid",
        borderWidth: 2,
        padding: 0,
        justifyContent: "center",
        borderColor: colors.border,
        backgroundColor: colors.surface,
        marginBottom: spacing.md,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 0,
    },
    imagePicker: {
        position: "absolute",
        right: 5,
        bottom: 5,
        backgroundColor: colors.primary,
        padding: 8,
        elevation: 20
    },
    buttonRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    smallButton: {
        flex: 1,
        borderWidth: 2,
        borderColor: colors.border,
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
        width: "100%",
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
        color: colors.text,
        fontWeight: '600',
    },
    picker: {
        width: '100%',
        color: colors.text,
    },
    actionButton: {
        width: '100%',
        borderWidth: 2,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    registerButton: {
        backgroundColor: colors.primary,
    },
    loginButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    actionButtonText: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: '700',
    },
    loginButtonText: {
        color: colors.accent,
    },
    disabledButton: {
        opacity: 0.7,
    },
    bottomSpace: {
        height: spacing.xl,
    },
});

export default Register;
