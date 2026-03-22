
import React, { useContext } from 'react'
import {
    StyleSheet,
    View,
    Dimensions,
    Image,
    Text,
    TouchableOpacity
} from 'react-native'

var { width, height } = Dimensions.get("window");
import { addToCart } from '../../Redux/Actions/cartActions'
import { useDispatch } from 'react-redux'
import Toast from 'react-native-toast-message'
import { colors, spacing } from '../../Shared/theme';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import { useNavigation } from '@react-navigation/native';

const ProductCard = (props) => {
    const { name, price, image, countInStock } = props;
    const dispatch = useDispatch()
    const context = useContext(AuthGlobal)
    const navigation = useNavigation()

    const handleAddToCart = () => {
        if (!context?.stateUser?.isAuthenticated) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Login required',
                text2: 'Please login to add items to your cart.',
            });
            navigation.navigate('User', { screen: 'Login' });
            return;
        }

        dispatch(addToCart({ ...props, quantity: 1 }));
        Toast.show({
            topOffset: 60,
            type: 'success',
            text1: `${name} added to Cart`,
            text2: 'Go to your cart to complete order',
        });
    };

    return (
        <View style={styles.container}>
            <Image
                style={styles.image}
                resizeMode="contain"
                source={{
                    uri: image ?
                        image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                }}
            />
            <View style={styles.imageSpacer} />
            <Text style={styles.brand}>{props.brand || 'Sports Gear'}</Text>
            <Text style={styles.title}>
                {name.length > 15 ? name.substring(0, 15 - 3)
                    + '...' : name
                }
            </Text>
            <Text style={styles.price}>PHP {(Number(price) || 0).toFixed(2)}</Text>

            {countInStock > 0 ? (
                <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={handleAddToCart}>
                    <Text style={styles.ctaText}>ADD TO CART</Text>
                </TouchableOpacity>
            ) : <Text style={styles.stockText}>OUT OF STOCK</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: width / 1.48,
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.md,
        alignItems: 'flex-start',
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.border,
    },
    image: {
        width: '100%',
        height: width / 3.4,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    imageSpacer: {
        height: 8,
        width: '100%',
    },
    brand: {
        marginTop: spacing.sm,
        marginBottom: 4,
        color: colors.muted,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.9,
    },
    title: {
        fontWeight: '700',
        fontSize: 15,
        color: colors.text,
        minHeight: 40,
    },
    price: {
        fontSize: 19,
        color: colors.primary,
        marginTop: spacing.sm,
        fontWeight: '800',
    },
    cta: {
        marginTop: spacing.md,
        width: '100%',
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: colors.primary,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaText: {
        color: colors.surface,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    stockText: {
        marginTop: spacing.md,
        color: colors.danger,
        fontWeight: '700',
    },
})

export default ProductCard;