import React, { Component } from "react";
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
} from "react-native";

var _ = require("lodash");

class PaginatedListView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}).cloneWithRows([])
        };

        this._isMounted = false;
        this.page = 0;
        this.rows = [];

        this.loadNextPage();
    }
    componentWillMount() {
        this._isMounted = true;

        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rows.slice(0))
        });
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    loadNextPage() {
        this.loading = true;
        this.props.loadFunction(this.page,this.dataLoaded.bind(this));
    }
    dataLoaded(totalPages,rows) {
        this.loading = false;
        this.totalPages = totalPages;
        this.rows = this.rows.concat(rows);

        if (!this._isMounted) return;

        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.rows.slice(0))
        });
    }
    onEndReached() { //TODO this seems to be firing prematurely..
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
                {...this.props}
                //renderSeparator={this.renderSeparator}
                //renderFooter={this.renderFooter}
                //keyboardDismissMode="on-drag"
                //keyboardShouldPersistTaps={true}
                //showsVerticalScrollIndicator={false}
            />
        )
    }
}

export default PaginatedListView;
