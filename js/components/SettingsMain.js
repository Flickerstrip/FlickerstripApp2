import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
} from "react-native";

var _ = require("lodash");

import layoutStyles from "~/styles/layoutStyles";
import skinStyles from "~/styles/skinStyles";
import EIcon from "react-native-vector-icons/EvilIcons";
import NIcon from "react-native-vector-icons/Entypo";
import SettingsList from "react-native-settings-list";
import UserService from "~/services/UserService";
import SettingsManager from "~/stores/SettingsManager";
import renderIf from "~/utils/renderIf"
import SettingsActions from "~/actions/SettingsActions";
import MenuButton from "~/components/MenuButton.js";
import Button from "react-native-button"

var defaultUser = {email:null,password:null};

class SettingsMain extends React.Component {
    constructor(props) {
        super(props);

        this.state={
            key: null,
            key:Math.random(),
            loggedIn: SettingsManager.isUserValid(),
            invalidUser: SettingsManager.isUserSet() ? !SettingsManager.isUserValid() : false,
            userEmail:SettingsManager.isUserSet() ? SettingsManager.getUser().email : defaultUser.email,
            userPass:SettingsManager.isUserSet() ? SettingsManager.getUser().password : defaultUser.password,
        };

        this.refresh = this.refresh.bind(this);
    }
    componentWillMount() {
        SettingsManager.on("UserUpdated",this.refresh);
        SettingsManager.on("WiFiUpdated",this.refresh);
    }
    componentWillUnMount() {
        SettingsManager.removeListener("UserUpdated",this.refresh);
        SettingsManager.removeListener("WiFiUpdated",this.refresh);
    }
    refresh() {
        this.setState({
            key:Math.random(),
            loggedIn: SettingsManager.isUserValid(),
            invalidUser: SettingsManager.isUserSet() ? !SettingsManager.isUserValid() : false,
            userEmail:SettingsManager.isUserSet() ? SettingsManager.getUser().email : defaultUser.email,
            userPass:SettingsManager.isUserSet() ? SettingsManager.getUser().password : defaultUser.password,
        });
    }
    render() {
        return (
            <View style={[{backgroundColor:"white"},layoutStyles.flexColumn]}>
                <SettingsList key={this.state.key}>
                    {this.state.loggedIn ?
                        <SettingsList.Item
                            icon={
                                <EIcon name="user" style={layoutStyles.imageIcon} size={50} color="rgba(0,136,204,1)" />
                            }
                            title={"Logged In As: "+SettingsManager.getUser().email}
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
                                <EIcon name="user" style={[layoutStyles.imageIcon, this.state.invalidUser ? skinStyles.dangerIcon : skinStyles.primaryIcon]} size={50} />
                            }
                            isAuth={true}
                            authPropsUser={{
                                placeholder:"HOhmBody account E-mail",
                                autoCapitalize:"none",
                                autoCorrect:false,
                                keyboardType:"email-address",
                                value:this.state.userEmail,
                                onChangeText:(value) => this.setState({"userEmail":value}),
                                onSubmitEditing:() => this._hohmbodyPassword.focus(),
                                clearButtonMode:"while-editing",
                            }}
                            authPropsPW={{
                                placeholder:"Password",
                                value:this.state.userPass,
                                autoCapitalize:"none",
                                autoCorrect:false,
                                onChangeText:(value) => this.setState({"userPass":value}),
                                ref:(c) => this._hohmbodyPassword = c,
                                clearButtonMode:"while-editing",
                            }}
                            onPress={() => UserService.validateUser(this.state.userEmail,this.state.userPass,(valid) => { !valid ? this.setState({invalidUser:true}) : SettingsActions.userLogin(this.state.userEmail,this.state.userPass) } )}
                        />
                    }


                    <SettingsList.Header headerStyle={{marginTop:15}}/>
                    {SettingsManager.isWiFiSet() ?
                        <SettingsList.Item
                            icon={
                                <NIcon name="signal" style={[layoutStyles.imageIcon, skinStyles.primaryIcon]} size={40} />
                            }
                            title={"Saved SSID: "+SettingsManager.getWiFi().ssid}
                            hasNavArrow={false}
                            onPress={() => {
                                MenuButton.showMenu([
                                    {"label":"Forget SSID", destructive:true, onPress:() => SettingsActions.saveWifi(null) },
                                    {"label":"Cancel", cancel:true},
                                ]);
                            }}
                        />

                    :
                        <SettingsList.Item
                            icon={
                                <NIcon name="signal" style={[layoutStyles.imageIcon, skinStyles.primaryIcon]} size={40} />
                            }
                            isAuth={true}
                            authPropsUser={{
                                placeholder:"SSID",
                                onChangeText:(value) => this.setState({"wifiSSID":value}),
                                onSubmitEditing:() => this._wifiPassword.focus(),
                                clearButtonMode:"while-editing",
                            }}
                            authPropsPW={{
                                placeholder:"Password",
                                onChangeText:(value) => this.setState({"wifiPass":value}),
                                ref:(c) => this._wifiPassword = c,
                                clearButtonMode:"while-editing",
                            }}
                            onPress={() => SettingsActions.saveWifi(this.state.wifiSSID,this.state.wifiPass)}
                        />
                    }
                </SettingsList>

                <Button
                    style={skinStyles.button}
                    onPress={() => SettingsActions.purgeLightworkCache()}
                >
                    Purge Lightwork Caches
                </Button>
            </View>
        )
    }
}

const styles = StyleSheet.create({
});

export default SettingsMain;

