import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TabBarIOS
} from 'react-native';


/*
class DummyApp extends React.Component { render() { return (<Text>Foo</Text>) } }
AppRegistry.registerComponent('FlickerstripApp', () => DummyApp);
*/

import EIcon from "react-native-vector-icons/EvilIcons";
import NIcon from "react-native-vector-icons/Entypo";
import FIcon from "react-native-vector-icons/FontAwesome";
import StripListing from "~/components/StripListing.js";
import LightworkEditor from "~/components/LightworkEditor.js";
import LightworksMain from "~/components/LightworksMain.js";
import FlickerstripManager from "~/stores/FlickerstripManager.js";
import layoutStyles from "~/styles/layoutStyles";

var Tabs = require("react-native-tabs");
var NavigationBar = require("react-native-navbar");
var _ = require("lodash");

var base64Icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAQAAACSR7JhAAADtUlEQVR4Ac3YA2Bj6QLH0XPT1Fzbtm29tW3btm3bfLZtv7e2ObZnms7d8Uw098tuetPzrxv8wiISrtVudrG2JXQZ4VOv+qUfmqCGGl1mqLhoA52oZlb0mrjsnhKpgeUNEs91Z0pd1kvihA3ULGVHiQO2narKSHKkEMulm9VgUyE60s1aWoMQUbpZOWE+kaqs4eLEjdIlZTcFZB0ndc1+lhB1lZrIuk5P2aib1NBpZaL+JaOGIt0ls47SKzLC7CqrlGF6RZ09HGoNy1lYl2aRSWL5GuzqWU1KafRdoRp0iOQEiDzgZPnG6DbldcomadViflnl/cL93tOoVbsOLVM2jylvdWjXolWX1hmfZbGR/wjypDjFLSZIRov09BgYmtUqPQPlQrPapecLgTIy0jMgPKtTeob2zWtrGH3xvjUkPCtNg/tm1rjwrMa+mdUkPd3hWbH0jArPGiU9ufCsNNWFZ40wpwn+62/66R2RUtoso1OB34tnLOcy7YB1fUdc9e0q3yru8PGM773vXsuZ5YIZX+5xmHwHGVvlrGPN6ZSiP1smOsMMde40wKv2VmwPPVXNut4sVpUreZiLBHi0qln/VQeI/LTMYXpsJtFiclUN+5HVZazim+Ky+7sAvxWnvjXrJFneVtLWLyPJu9K3cXLWeOlbMTlrIelbMDlrLenrjEQOtIF+fuI9xRp9ZBFp6+b6WT8RrxEpdK64BuvHgDk+vUy+b5hYk6zfyfs051gRoNO1usU12WWRWL73/MMEy9pMi9qIrR4ZpV16Rrvduxazmy1FSvuFXRkqTnE7m2kdb5U8xGjLw/spRr1uTov4uOgQE+0N/DvFrG/Jt7i/FzwxbA9kDanhf2w+t4V97G8lrT7wc08aA2QNUkuTfW/KimT01wdlfK4yEw030VfT0RtZbzjeMprNq8m8tnSTASrTLti64oBNdpmMQm0eEwvfPwRbUBywG5TzjPCsdwk3IeAXjQblLCoXnDVeoAz6SfJNk5TTzytCNZk/POtTSV40NwOFWzw86wNJRpubpXsn60NJFlHeqlYRbslqZm2jnEZ3qcSKgm0kTli3zZVS7y/iivZTweYXJ26Y+RTbV1zh3hYkgyFGSTKPfRVbRqWWVReaxYeSLarYv1Qqsmh1s95S7G+eEWK0f3jYKTbV6bOwepjfhtafsvUsqrQvrGC8YhmnO9cSCk3yuY984F1vesdHYhWJ5FvASlacshUsajFt2mUM9pqzvKGcyNJW0arTKN1GGGzQlH0tXwLDgQTurS8eIQAAAABJRU5ErkJggg==';

class FlickerstripApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 'strips',
      //selectedTab: 'lightworks',
      //selectedTab: 'editor',
      notifCount: 0,
      presses: 0,
    }
  }

  render() {
    var rightButtonConfig = {
      title: 'Next',
      handler: function onNext() {
        alert('hello!');
      }
    };

    var titleConfig = {
      title: 'Hello, world',
    };

    var menuButton = (<EIcon name="navicon" size={30} color="rgba(0,136,204,1)" style={styles.titleIcon} />);
    var stripsButton = (<NIcon name="signal" size={30} color="rgba(0,136,204,1)" />);

    return (
        <TabBarIOS unselectedTintColor="yellow" tintColor="white" barTintColor="darkslateblue">
            <NIcon.TabBarItemIOS
              title="Strips"
              iconName="signal"
              badge={_.filter(FlickerstripManager.strips,(strip) => {strip.selected}).length || null}
              selected={this.state.selectedTab === 'strips'}
              onPress={() => {
                this.setState({
                  selectedTab: 'strips',
                });
              }}>
              <View style={[layoutStyles.flexColumn, styles.marginBottomForTab]}>
                  <NavigationBar title={titleConfig} rightButton={menuButton} />
                  <StripListing style={layoutStyles.flexColumn}/>
              </View>
            </NIcon.TabBarItemIOS>

            <FIcon.TabBarItemIOS
              title="Lightworks"
              iconName="cube"
              selected={this.state.selectedTab === 'lightworks'}
              onPress={() => {
                this.setState({
                  selectedTab: 'lightworks',
                  presses: this.state.presses + 1
                });
              }}>
              <View style={[layoutStyles.flexColumn,styles.marginBottomForTab]}>
                  <NavigationBar title={titleConfig} rightButton={menuButton} />
                  <LightworksMain style={[layoutStyles.flexColumn]} />
              </View>
            </FIcon.TabBarItemIOS>
            <FIcon.TabBarItemIOS
              title="Editor"
              iconName="pencil"
              //badge={this.state.notifCount > 0 ? this.state.notifCount : undefined}
              selected={this.state.selectedTab === 'editor'}
              onPress={() => {
                this.setState({
                  selectedTab: 'editor',
                  notifCount: this.state.notifCount + 1,
                });
              }}>
              <View style={[layoutStyles.flexColumn, styles.marginBottomForTab]}>
                  <NavigationBar title={titleConfig} rightButton={menuButton} />
                  <LightworkEditor />
              </View>
            </FIcon.TabBarItemIOS>

            <FIcon.TabBarItemIOS
              title="Settings"
              iconName="cogs"
              selected={this.state.selectedTab === 'settings'}
              onPress={() => {
                this.setState({
                  selectedTab: 'settings',
                  presses: this.state.presses + 1
                });
              }}>
              <View style={[layoutStyles.flexColumn, styles.marginBottomForTab]}>
                  <NavigationBar title={titleConfig} rightButton={menuButton} />
                  <Text>Settings</Text>
              </View>
            </FIcon.TabBarItemIOS>
        </TabBarIOS>
    );
  }
}

const styles = StyleSheet.create({
  marginBottomForTab:{
    marginBottom: 50
  },
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  titleIcon: {
    paddingTop:9,
    paddingRight:7,
  },
});

AppRegistry.registerComponent('FlickerstripApp', () => FlickerstripApp);
