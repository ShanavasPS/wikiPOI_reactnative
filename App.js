import React from 'react';
import {FlatList, ActivityIndicator, View, Button} from 'react-native';
import MapView from 'react-native-maps';

navigator.geolocation = require('@react-native-community/geolocation');

export default class FetchExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        this._getArticles(position.coords.latitude, position.coords.longitude);
      },
      error => alert(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  }

  _getArticles(latitude, longitude) {
    fetch(
      'https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=10000&gscoord=' +
        latitude +
        '%7C' +
        longitude +
        '&gslimit=50&format=json',
    )
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson.query.geosearch.length);
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

  _onZoomInPressed = () => {
    console.log('You tapped _onZoomInPressed!');
    this.setState({
      longitudeDelta: this.state.longitudeDelta - 0.02,
      latitudeDelta: this.state.latitudeDelta - 0.02,
    });
  };

  _onZoomOutPressed = () => {
    console.log('You tapped _onZoomOutPressed!');
    this.setState({
      longitudeDelta: this.state.longitudeDelta + 0.02,
      latitudeDelta: this.state.latitudeDelta + 0.02,
    });
  };

  onRegionChange(region) {
    this.setState({region});
  }

  render() {
    this.state.initialRegion = {
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      latitudeDelta: this.state.latitudeDelta,
      longitudeDelta: this.state.longitudeDelta,
    };

    this.state.region = {
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      latitudeDelta: this.state.latitudeDelta,
      longitudeDelta: this.state.longitudeDelta,
    };

    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator />
        </View>
      );
    }

    return (
      <View style={{flex: 1}}>
        <MapView
          initialRegion={this.state.initialRegion}
          region={this.state.region}
          style={{flex: 1}}
          showsUserLocation={true}>
          {!!this.state.latitude && !!this.state.longitude && (
            <MapView.Marker
              coordinate={{
                latitude: this.state.latitude,
                longitude: this.state.longitude,
              }}
              title={'Your Location'}
            />
          )}
          {this.state.dataSource.map(marker => (
            <MapView.Marker
              coordinate={{
                latitude: marker.lat,
                longitude: marker.lon,
              }}
              title={marker.title}
            />
          ))}
        </MapView>
        <Button
          style={{flex: 2}}
          title="Zoom In"
          onPress={this._onZoomInPressed}
        />
        <Button
          style={{flex: 2}}
          title="Zoom Out"
          onPress={this._onZoomOutPressed}
        />
      </View>
    );
  }
}
