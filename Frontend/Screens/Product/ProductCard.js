
import {
    StyleSheet,
    View,
    Dimensions,
    Image,
    Text,
    Button
} from 'react-native'

var { width, height } = Dimensions.get("window");
import { addToCart } from '../../Redux/Actions/cartActions'
import { useDispatch } from 'react-redux'
import Toast from 'react-native-toast-message'
import { colors, radius, shadow, spacing } from '../../Shared/theme';

const ProductCard = (props) => {
    const { name, price, image, countInStock } = props;
    const dispatch = useDispatch()

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
            <View style={styles.card} />
            <Text style={styles.brand}>{props.brand}</Text>
            <Text style={styles.title}>
                {name.length > 15 ? name.substring(0, 15 - 3)
                    + '...' : name
                }
            </Text>
            <Text style={styles.price}>${price}</Text>

            {countInStock > 0 ? (
                <View style={styles.buttonWrap}>
                    <Button title={'Add'} color={'green'}
                        onPress={() => {
                            dispatch(addToCart({ ...props, quantity: 1, })),
                                Toast.show({
                                    topOffset: 60,
                                    type: "success",
                                    text1: `${name} added to Cart`,
                                    text2: "Go to your cart to complete order"
                                })
                        }}
                    />
                </View>
            ) : <Text style={{ marginTop: 20 }}>Currently Unavailable</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: width / 1.62,
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderRadius: radius.lg,
        marginTop: 20,
        marginBottom: spacing.md,
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadow,
    },
    image: {
        width: '72%',
        height: width / 3.9,
        backgroundColor: 'transparent',
        position: 'absolute',
        top: -18,
    },
    card: {
        marginBottom: 8,
        height: width / 2 - 20 - 100,
        backgroundColor: 'transparent',
        width: '100%'
    },
    brand: {
        marginTop: 88,
        color: colors.muted,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    title: {
        fontWeight: "bold",
        fontSize: 15,
        textAlign: 'center'
    },
    price: {
        fontSize: 18,
        color: colors.accent,
        marginTop: 8,
        fontWeight: '800',
    },
    buttonWrap: {
        marginBottom: 24,
    }
})

export default ProductCard;