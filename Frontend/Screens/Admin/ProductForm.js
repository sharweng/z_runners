import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform
} from "react-native"
import { Surface } from "react-native-paper"
import { Picker } from "@react-native-picker/picker"

import FormContainer from "../../Shared/FormContainer"
import Input from "../../Shared/Input"
import EasyButton from "../../Shared/StyledComponents/EasyButton"


import Toast from "react-native-toast-message"
import AsyncStorage from '@react-native-async-storage/async-storage'
import Error from "../../Shared/Error"
import * as ImagePicker from "expo-image-picker"
import { useNavigation } from "@react-navigation/native"
import mime from "mime";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing } from "../../Shared/theme";
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct } from '../../Redux/Actions/productActions';
import { fetchCategories } from '../../Redux/Actions/categoryActions';


const ProductForm = (props) => {
    // console.log(props.route.params)
    const [pickerValue, setPickerValue] = useState('');
    const [brand, setBrand] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [mainImage, setMainImage] = useState();
    const [category, setCategory] = useState('');
    const [token, setToken] = useState();
    const [error, setError] = useState();
    const [countInStock, setCountInStock] = useState();
    const [rating, setRating] = useState(0);
    const [isFeatured, setIsFeatured] = useState(false);
    const [richDescription, setRichDescription] = useState();
    const [numReviews, setNumReviews] = useState(0);
    const [item, setItem] = useState(null);

    let navigation = useNavigation()
    const dispatch = useDispatch();
    const { items: categories } = useSelector((state) => state.categories);

    const getEntityId = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value.id || value._id || '';
    };

    useEffect(() => {
        if (!props.route.params) {
            setItem(null);
        } else {
            setItem(props.route.params.item);
            setBrand(props.route.params.item.brand);
            setName(props.route.params.item.name);
            setPrice(props.route.params.item.price.toString());
            setDescription(props.route.params.item.description);
            setMainImage(props.route.params.item.image);
            setImage(props.route.params.item.image);
            const selectedCategoryId = getEntityId(props.route.params.item.category);
            setCategory(selectedCategoryId);
            setPickerValue(selectedCategoryId);
            setCountInStock(props.route.params.item.countInStock.toString());
        }
        AsyncStorage.getItem("jwt")
            .then((res) => {
                setToken(res)
            })
            .catch((error) => console.log(error))
        dispatch(fetchCategories())
            .catch(() => alert("Error to load categories"));
        (async () => {
            if (Platform.OS !== "web") {
                const {
                    status,
                } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                    alert("Sorry, we need camera roll permissions to make this work!")
                }
            }
        })();
    }, [dispatch])

    useEffect(() => {
        if (item || !categories?.length) {
            return;
        }

        if (!pickerValue || !category) {
            const firstCategoryId = getEntityId(categories[0]);
            if (firstCategoryId) {
                setPickerValue(firstCategoryId);
                setCategory(firstCategoryId);
            }
        }
    }, [categories, item, pickerValue, category]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images',],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });

        if (!result.canceled) {
            console.log(result.assets)
            setMainImage(result.assets[0].uri);
            setImage(result.assets[0].uri);
        }
    }


    const addProduct = () => {
        setError(null);

        if (
            !name?.trim() ||
            !brand?.trim() ||
            `${price}`.trim() === "" ||
            !description?.trim() ||
            !category ||
            `${countInStock}`.trim() === ""
        ) {
            setError("Please fill in the form correctly")
            return;
        }

        if (!item && !image) {
            setError("Please select a product image")
            return;
        }

        if (!token) {
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Session expired",
                text2: "Please login again"
            });
            navigation.navigate("Login");
            return;
        }

        let formData = new FormData();
        const hasLocalImage = typeof image === "string" && image.startsWith("file://");

        formData.append("name", name);
        formData.append("brand", brand);
        formData.append("price", price);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("countInStock", countInStock);
        formData.append("richDescription", richDescription);
        formData.append("rating", rating);
        formData.append("numReviews", numReviews);
        formData.append("isFeatured", isFeatured);
        if (hasLocalImage) {
            formData.append("image", {
                uri: image,
                type: mime.getType(image),
                name: image.split("/").pop()
            });
        }

        if (item !== null) {
            dispatch(updateProduct(getEntityId(item), formData, token))
                .then(() => {
                    Toast.show({
                        topOffset: 60,
                        type: "success",
                        text1: "Product successfuly updated",
                        text2: ""
                    });
                    setTimeout(() => {
                        navigation.navigate("Products");
                    }, 500)
                })
                .catch((error) => {
                    const msg = error?.response?.data?.message;
                    Toast.show({
                        topOffset: 60,
                        type: "error",
                        text1: "Something went wrong",
                        text2: msg || "Please try again"
                    })
                })
        } else {
            dispatch(createProduct(formData, token))
                .then(() => {
                    Toast.show({
                        topOffset: 60,
                        type: "success",
                        text1: "New Product added",
                        text2: ""
                    });
                    setTimeout(() => {
                        navigation.navigate("Products");
                    }, 500)
                })
                .catch((error) => {
                    const msg = error?.response?.data?.message;
                    if (error?.response?.status === 401) {
                        Toast.show({
                            topOffset: 60,
                            type: "error",
                            text1: "Not authorized",
                            text2: "Please login again"
                        });
                        navigation.navigate("Login");
                        return;
                    }

                    console.log(error)
                    Toast.show({
                        topOffset: 60,
                        type: "error",
                        text1: "Something went wrong",
                        text2: msg || "Please try again"
                    })
                })

        }

    }
    return (
        <FormContainer title="Add Product">
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={{ uri: mainImage }} />
                <TouchableOpacity
                    onPress={pickImage}
                    style={styles.imagePicker}>
                    <Ionicons style={{ color: "white" }} name="camera" />
                </TouchableOpacity>
            </View>
            <View style={styles.label}>
                <Text style={{ textDecorationLine: "underline" }}>Brand</Text>
            </View>
            <Input
                placeholder="Brand"
                name="brand"
                id="brand"
                value={brand}
                onChangeText={(text) => setBrand(text)}
            />
            <View style={styles.label}>
                <Text style={{ textDecorationLine: "underline" }}>Name</Text>
            </View>
            <Input
                placeholder="Name"
                name="name"
                id="name"
                value={name}
                onChangeText={(text) => setName(text)}
            />
            <View style={styles.label}>
                <Text style={{ textDecorationLine: "underline" }}>Price</Text>
            </View>
            <Input
                placeholder="Price"
                name="price"
                id="price"
                value={price}
                keyboardType={"numeric"}
                onChangeText={(text) => setPrice(text)}
            />
            <View style={styles.label}>
                <Text style={{ textDecorationLine: "underline" }}>Count in Stock</Text>
            </View>
            <Input
                placeholder="Stock"
                name="stock"
                id="stock"
                value={countInStock}
                keyboardType={"numeric"}
                onChangeText={(text) => setCountInStock(text)}
            />
            <View style={styles.label}>
                <Text style={{ textDecorationLine: "underline" }}>Description</Text>
            </View>
            <Input
                placeholder="Description"
                name="description"
                id="description"
                value={description}
                onChangeText={(text) => setDescription(text)}
            />
            <View>
                <Picker
                    label="Categories"
                    selectionColor="red"
                    style={{ height: 100, width: 300 }}
                    minWidth="100%"
                    placeholder="Select your Category"
                    selectedValue={pickerValue}
                    onValueChange={(e) => {
                        setPickerValue(e);
                        setCategory(e || '');
                        if (error) {
                            setError(null);
                        }
                    }} >
                    {categories.map((c, index) => {
                        const categoryId = getEntityId(c);
                        return (
                            <Picker.Item
                                key={categoryId}
                                label={c.name}
                                value={categoryId} />
                        )
                    })}

                </Picker>
            </View>
            {error ? <Error message={error} /> : null}
            <View style={styles.buttonContainer}>
                <EasyButton
                    large
                    primary
                    onPress={() => addProduct()}
                ><Text style={styles.buttonText}>Confirm</Text>
                </EasyButton>
            </View>
        </FormContainer>
    )
}


const styles = StyleSheet.create({
    label: {
        width: "100%",
        marginTop: 10
    },
    buttonContainer: {
        width: "100%",
        marginBottom: 100,
        marginTop: 20,
        alignItems: "center"
    },
    buttonText: {
        color: "white"
    },
    imageContainer: {
        width: 200,
        height: 200,
        borderStyle: "solid",
        borderWidth: 1,
        padding: 0,
        justifyContent: "center",
        borderRadius: 100,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...shadow,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 100
    },
    imagePicker: {
        position: "absolute",
        right: 5,
        bottom: 5,
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 100,
        elevation: 20
    }
})


export default ProductForm;