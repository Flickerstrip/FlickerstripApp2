import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
} from 'react-native';

var _ = require("lodash");

import layoutStyles from "~/styles/layoutStyles";
import EIcon from "react-native-vector-icons/EvilIcons";
import NIcon from "react-native-vector-icons/Entypo";
import SettingsList from 'react-native-settings-list';
import UserService from "~/services/UserService";
import SettingsManager from "~/stores/SettingsManager";
import renderIf from "~/utils/renderIf"
import SettingsActions from "~/actions/SettingsActions";
import MenuButton from "~/components/MenuButton.js";

class SettingsMain extends React.Component {
    constructor(props) {
        super(props);

        this.state={key: null};

        SettingsManager.on("UserUpdated",function() {
            this.refresh();
        }.bind(this));
    }
    refresh() {
        this.setState({key:Math.random()});
    }
    render() {
        return (
            <View style={[{backgroundColor:'#EFEFF4'},layoutStyles.flexColumn]}>
                <SettingsList key={this.state.key}>
                    {SettingsManager.isUserSet() ?
                        <SettingsList.Item
                            icon={
                                <EIcon name="user" style={styles.imageIcon} size={50} color="rgba(0,136,204,1)" />
                            }
                            title={'Logged In As: '+SettingsManager.getUser().email}
                            hasNavArrow={false}
                            onPress={() => {
                                MenuButton.showMenu([
                                    {"label":"Logout", destructive:true, onPress:() => SettingsActions.userLogout() },
                                    {"label":"Cancel", cancel:true},
                                ]);
                            }}
                        />
                    :
                        <SettingsList.Item
                            icon={
                                <EIcon name="user" style={styles.imageIcon} size={50} color="rgba(0,136,204,1)" />
                            }
                            isAuth={true}
                            authPropsUser={{placeholder:'HOhmBody account E-mail', onChangeText:(value) => this.setState({"userEmail":value})}}
                            authPropsPW={{placeholder:'Password', onChangeText:(value) => this.setState({"userPass":value})}}
                            onPress={() => UserService.validateUser(this.state.userEmail,this.state.userPass,(valid) => { if (valid) SettingsActions.userLogin(this.state.userEmail,this.state.userPass) } )}
                        />
                    }


                    <SettingsList.Header headerStyle={{marginTop:15}}/>
                    <SettingsList.Item
                        icon={
                            <NIcon name="signal" style={styles.imageIcon} size={50} color="rgba(0,136,204,1)" />
                        }
                        isAuth={true}
                        authPropsUser={{placeholder:'SSID', onChangeText:(value) => this.setState({"wifiSSID":value})}}
                        authPropsPW={{placeholder:'Password', onChangeText:(value) => this.setState({"wifiPass":value})}}
                        onPress={() => console.log("do wifi",this.state.userEmail,this.state.userPass)}
                    />
                </SettingsList>
            </View>
        )
    }
}

const styles = StyleSheet.create({
  imageIcon:{
    marginTop: 10,
    marginLeft:15,
    alignSelf:'center',
    height:50,
    width:50
  },
});

export default SettingsMain;

