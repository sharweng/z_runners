import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform,
    ScrollView
} from "react-native"
import { Surface } from "react-native-paper"
import { Picker } from "@react-native-picker/picker"

import FormContainer from "../../Shared/FormContainer"
import Input from "../../Shared/Input"
import EasyButton from "../../Shared/StyledComponents/EasyButton"


import Toast from "react-native-toast-message"
import Error from "../../Shared/Error"
import * as ImagePicker from "expo-image-picker"
import { useNavigation } from "@react-navigation/native"
import mime from "mime";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow, spacing } from "../../Shared/theme";
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct, uploadProductGalleryImages } from '../../Redux/Actions/productActions';
import { fetchCategories } from '../../Redux/Actions/categoryActions';
import { getJwtToken } from "../../utils/tokenStorage";


const ProductForm = (props) => {
    // console.log(props.route.params)
    const [brand, setBrand] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [galleryImages, setGalleryImages] = useState([]);
    const [category, setCategory] = useState('');
    const [token, setToken] = useState();
    const [error, setError] = useState();
    const [countInStock, setCountInStock] = useState();
    const [rating, setRating] = useState(0);
    const [isFeatured, setIsFeatured] = useState(false);
    const [richDescription, setRichDescription] = useState();
    const [numReviews, setNumReviews] = useState(0);
    const [item, setItem] = useState(null);
    const [hasUserChangedCategory, setHasUserChangedCategory] = useState(false);

    let navigation = useNavigation()
    const dispatch = useDispatch();
    const { items: categories } = useSelector((state) => state.categories);
    const routeItem = props.route?.params?.item;

    const getEntityId = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value.id || value._id || '';
    };

    const getCategoryName = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value.name || '';
    };

    const normalizeText = (value) => (value || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

    const resolveCategoryId = (categoryValue, availableCategories) => {
        if (!categoryValue || !availableCategories?.length) {
            return '';
        }

        const rawId = getEntityId(categoryValue);
        if (rawId) {
            const byId = availableCategories.find((c) => getEntityId(c) === rawId);
            if (byId) {
                return getEntityId(byId);
            }
        }

        const rawName = getCategoryName(categoryValue);
        if (!rawName) {
            return '';
        }

        const normalizedRawName = normalizeText(rawName);
        const byName = availableCategories.find((c) => normalizeText(c?.name) === normalizedRawName);
        return byName ? getEntityId(byName) : '';
    };

    useEffect(() => {
        if (!routeItem) {
            setItem(null);
            setBrand('');
            setName('');
            setPrice('');
            setDescription('');
            setMainImage('');
            setGalleryImages([]);
            setCategory('');
            setHasUserChangedCategory(false);
            setCountInStock('');
        } else {
            setItem(routeItem);
            setBrand(routeItem.brand || '');
            setName(routeItem.name || '');
            setPrice(routeItem.price?.toString?.() || '');
            setDescription(routeItem.description || '');

            const existingImages = [routeItem.image, ...(Array.isArray(routeItem.images) ? routeItem.images : [])]
                .filter(Boolean)
                .filter((value, index, arr) => arr.indexOf(value) === index)
                .map((uri) => ({ uri }));

            setGalleryImages(existingImages);
            setMainImage(existingImages[0]?.uri || '');

            const selectedCategoryId = getEntityId(routeItem.category);
            setCategory(selectedCategoryId || '');
            setHasUserChangedCategory(false);
            setCountInStock(routeItem.countInStock?.toString?.() || '');
        }
    }, [routeItem]);

    useEffect(() => {
        getJwtToken()
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
                const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                    alert("Sorry, camera permission is required to take product photos.")
                }
                if (mediaPermission.status !== "granted") {
                    alert("Sorry, media library permission is required to upload product photos.")
                }
            }
        })();
    }, [dispatch])

    useEffect(() => {
        if (item || !categories?.length) {
            return;
        }

        if (!category) {
            const firstCategoryId = getEntityId(categories[0]);
            if (firstCategoryId) {
                setCategory(firstCategoryId);
            }
        }
    }, [categories, item, category]);

    useEffect(() => {
        if (!item || !categories?.length || hasUserChangedCategory) {
            return;
        }

        const resolvedId = resolveCategoryId(item.category, categories);
        if (!resolvedId) {
            return;
        }

        if (resolvedId === category) {
            return;
        }

        setCategory(resolvedId);
    }, [item, categories, category, hasUserChangedCategory]);

    const appendImages = (assets) => {
        const incoming = (assets || [])
            .map((asset) => asset?.uri)
            .filter(Boolean)
            .map((uri) => ({ uri }));

        if (!incoming.length) {
            return;
        }

        setGalleryImages((prev) => {
            const merged = [...prev, ...incoming].filter(
                (value, index, arr) => arr.findIndex((entry) => entry.uri === value.uri) === index
            );

            if (!mainImage && merged[0]?.uri) {
                setMainImage(merged[0].uri);
            }

            return merged;
        });

        if (!mainImage) {
            setMainImage(incoming[0].uri);
        }

        if (error) {
            setError(null);
        }
    };

    const pickFromLibrary = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1
        });

        if (!result.canceled) {
            appendImages(result.assets);
        }
    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            appendImages(result.assets);
        }
    };

    const setPrimaryImage = (uri) => {
        if (!uri) {
            return;
        }

        setMainImage(uri);
        setGalleryImages((prev) => {
            const selected = prev.find((entry) => entry.uri === uri);
            if (!selected) {
                return prev;
            }

            const remaining = prev.filter((entry) => entry.uri !== uri);
            return [selected, ...remaining];
        });
    };

    const removeImage = (uri) => {
        setGalleryImages((prev) => {
            const updated = prev.filter((entry) => entry.uri !== uri);

            if (mainImage === uri) {
                setMainImage(updated[0]?.uri || '');
            }

            return updated;
        });
    };

    const syncProductGallery = async (productId) => {
        if (!productId) {
            return;
        }

        const existingImages = galleryImages
            .map((entry) => entry.uri)
            .filter((uri) => uri && !uri.startsWith('file://') && uri !== mainImage);

        const localImages = galleryImages
            .map((entry) => entry.uri)
            .filter((uri) => uri && uri.startsWith('file://') && uri !== mainImage);

        if (!existingImages.length && !localImages.length) {
            return;
        }

        const galleryFormData = new FormData();
        existingImages.forEach((uri) => {
            galleryFormData.append('existingImages', uri);
        });

        localImages.forEach((uri) => {
            galleryFormData.append('images', {
                uri,
                type: mime.getType(uri) || 'image/jpeg',
                name: uri.split('/').pop() || `gallery-${Date.now()}.jpg`,
            });
        });

        await dispatch(uploadProductGalleryImages(productId, galleryFormData, token));
    };


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

        if (!galleryImages.length || !mainImage) {
            setError("Please add at least one product image")
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
    const hasLocalMainImage = typeof mainImage === "string" && mainImage.startsWith("file://");

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
        if (hasLocalMainImage) {
            formData.append("image", {
                uri: mainImage,
                type: mime.getType(mainImage),
                name: mainImage.split("/").pop()
            });
        } else if (typeof mainImage === 'string' && mainImage.trim()) {
            formData.append('imagePath', mainImage.trim());
        }

        if (item !== null) {
            dispatch(updateProduct(getEntityId(item), formData, token))
                .then((updatedProduct) => {
                    const productId = getEntityId(updatedProduct) || getEntityId(item);
                    return syncProductGallery(productId);
                })
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
                .then((createdProduct) => {
                    const productId = getEntityId(createdProduct);
                    return syncProductGallery(productId);
                })
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
                {mainImage ? <Image style={styles.image} source={{ uri: mainImage }} /> : null}
            </View>
            <View style={styles.imageActionsRow}>
                <TouchableOpacity onPress={pickFromLibrary} style={styles.imageActionButton}>
                    <Ionicons style={styles.imageActionIcon} name="images-outline" />
                    <Text style={styles.imageActionText}>Upload</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={takePhoto} style={styles.imageActionButton}>
                    <Ionicons style={styles.imageActionIcon} name="camera-outline" />
                    <Text style={styles.imageActionText}>Take Photo</Text>
                </TouchableOpacity>
            </View>

            {galleryImages.length ? (
                <>
                    <View style={styles.label}>
                        <Text style={{ textDecorationLine: "underline" }}>Product Images (tap to set primary)</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
                        {galleryImages.map((entry) => (
                            <View key={entry.uri} style={styles.galleryItemWrap}>
                                <TouchableOpacity onPress={() => setPrimaryImage(entry.uri)}>
                                    <Image
                                        source={{ uri: entry.uri }}
                                        style={[
                                            styles.galleryImage,
                                            mainImage === entry.uri ? styles.galleryImagePrimary : null,
                                        ]}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeImage(entry.uri)}
                                >
                                    <Ionicons name="close" color="white" size={14} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </>
            ) : null}
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
                    selectedValue={category || ''}
                    onValueChange={(e) => {
                        setHasUserChangedCategory(true);
                        setCategory(e || '');
                        if (error) {
                            setError(null);
                        }
                    }} >
                    <Picker.Item label="Select Category" value="" />
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
    imageActionsRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    imageActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    imageActionIcon: {
        color: 'white',
        marginRight: spacing.xs,
    },
    imageActionText: {
        color: 'white',
        fontWeight: '700',
    },
    galleryRow: {
        paddingVertical: spacing.sm,
        paddingRight: spacing.md,
    },
    galleryItemWrap: {
        marginRight: spacing.sm,
    },
    galleryImage: {
        width: 72,
        height: 72,
        borderRadius: radius.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    galleryImagePrimary: {
        borderColor: colors.primary,
    },
    removeImageButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.danger,
        borderRadius: radius.pill,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
})


export default ProductForm;