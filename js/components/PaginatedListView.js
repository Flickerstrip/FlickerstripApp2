import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
} from 'react-native';

var _ = require("lodash");

class PaginatedListView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}).cloneWithRows([])
        };

        this.page = 0;
        this.rows = [];

        this.loadNextPage();
    }
    loadNextPage() {
        this.loading = true;
        console.log("callbing load function");
        this.props.loadFunction(this.page,this.dataLoaded.bind(this));
    }
    dataLoaded(totalPages,rows) {
        console.log("data loaded");
        this.loading = false;
        this.totalPages = totalPages;
        this.rows = this.rows.concat(rows);
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rows.slice(0))
        });
    }
    onEndReached() {
        console.log("end reached!");
        if (this.loading) return;
        if (this.page+1 >= this.totalPages) return; //end reached

        this.page++;
        this.loadNextPage()
    }
    render() {
        return (
            <ListView
                style={this.props.style}
                enableEmptySections={true}
                renderRow={this.props.renderRow}
                dataSource={this.state.dataSource}
                onEndReached={this.onEndReached.bind(this)}
                //renderSeparator={this.renderSeparator}
                //renderFooter={this.renderFooter}
                //automaticallyAdjustContentInsets={false}
                //keyboardDismissMode="on-drag"
                //keyboardShouldPersistTaps={true}
                //showsVerticalScrollIndicator={false}
            />
        )
    }
}

export default PaginatedListView;
