import React from 'react';
import {FlatList, ActivityIndicator, View, Button} from 'react-native';

export default class FetchExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isLoading: true};
  }

  componentDidMount() {
    return fetch(
      'https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=10000&gscoord=60.1831906%7C24.9285439&gslimit=50&format=json',
    )
      .then(response => response.json())
      .then(responseJson => {
        this.setState(
          {
            isLoading: false,
            dataSource: responseJson.query.geosearch,
          },
          function() {},
        );
      })
      .catch(error => {
        console.error(error);
      });
  }

  _getPageDetails(id) {
    fetch(
      'https://en.wikipedia.org/w/api.php?action=query&prop=info|description|images&pageids=' +
        id +
        '&format=json',
    )
      .then(response => response.json())
      .then(responseJson => {
        Object.values(responseJson.query.pages).map((val, ind) => {
          console.log(
            !val.description ? 'No description available' : val.description,
          );
          alert(
            !val.description ? 'No description available' : val.description,
          );
        });

        var output = Object.values(responseJson.query.pages).reduce(function(
          acc,
          item,
        ) {
          return item;
        },
        {});

        console.log('output is' + output.description);
        this.setState(
          {
            isLoading: false,
            pageDetails: responseJson.query.pages.pageid,
          },
          function() {},
        );
      })
      .catch(error => {
        console.error(error);
      });
  }

  _onPressButton = (text, id) => {
    this._getPageDetails(id);
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={{flex: 1, paddingTop: 80, paddingLeft: 20}}>
        <FlatList
          data={this.state.dataSource}
          renderItem={({item}) => (
            <Button
              title={item.title}
              onPress={() => this._getPageDetails(item.pageid)}
            />
          )}
          keyExtractor={({id}, index) => id}
        />
      </View>
    );
  }
}
