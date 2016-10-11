import {
    StyleSheet,
} from 'react-native';

const layoutStyles = StyleSheet.create({
    flexColumn: {
        flex: 1,
        flexDirection: "column"
    },
    flexCenter: {
        justifyContent: 'center',
    },
    flexRow: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    flex0: {
        flex: 0,
    },
    flex1: {
        flex: 1,
    },
    marginBottomForTab:{
        marginBottom: 50
    },
    paddingTopForNavigation:{
        paddingTop: 64
    },
    imageIcon:{
        marginTop: 10,
        marginLeft:15,
        alignSelf:'center',
        height:50,
        width:50
    },
});

export default layoutStyles;
