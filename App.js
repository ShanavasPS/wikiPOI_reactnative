import React from 'react';
import {
  FlatList,
  ActivityIndicator,
  View,
  Button,
  Text,
  Linking,
} from 'react-native';
import MapView from 'react-native-maps';
import Polyline from '@mapbox/polyline';
navigator.geolocation = require('@react-native-community/geolocation');
import {googleapikey} from './Config';

export default class FetchExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
      titleText: 'Title',
      descriptionText: 'Description',
      coords: [],
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

  _getRouteSuggestions(id) {
    fetch(
      'https://en.wikipedia.org/w/api.php?action=query&prop=info|description|images&pageids=' +
        id +
        '&format=json',
    )
      .then(response => response.json())
      .then(responseJson => {
        Object.values(responseJson.query.pages).map((val, ind) => {
          // console.log(
          //   !val.description ? 'No description available' : val.description,
          // );
        });

        var output = Object.values(responseJson.query.pages).reduce(function(
          acc,
          item,
        ) {
          return item;
        },
        {});

        console.log(output.description);
        this.setState(
          {
            isLoading: false,
            pageDetails: output,
            titleText: output.title,
            descriptionText: output.description,
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
          // console.log(
          //   !val.description ? 'No description available' : val.description,
          // );
        });

        var output = Object.values(responseJson.query.pages).reduce(function(
          acc,
          item,
        ) {
          return item;
        },
        {});

        console.log(output.description);
        this.setState(
          {
            isLoading: false,
            pageDetails: output,
            titleText: output.title,
            descriptionText: output.description,
          },
          function() {},
        );
      })
      .catch(error => {
        console.error(error);
      });
  }

  async getDirections(startLoc, destinationLoc) {
    try {
      let resp = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destinationLoc}&mode=transit&alternatives=true&key=${googleapikey}`,
      );
      let respJson = await resp.json();
      this.setState({routes: respJson.routes});
    } catch (error) {
      alert(error);
      return error;
    }
  }

  _onMarkerPressed = marker => {
    console.log('Pressed marker with page id ' + marker.pageid);
    this._getPageDetails(marker.pageid);
    this.setState({
      currentMarker: marker,
      routes: [],
      coords: [],
    });
  };

  _onRoutePressed = route => {
    console.log('Pressed route pressed ');
    let points = Polyline.decode(route.overview_polyline.points);
    let coords = points.map((point, index) => {
      return {
        latitude: point[0],
        longitude: point[1],
      };
    });
    this.setState({coords: coords});
    console.log(route.legs);
  };

  _onPressButton = (text, id) => {
    this._getPageDetails(id);
  };

  _onWikipediaPressed = () => {
    console.log('You tapped _onWikipediaPressed!');
    console.log(this.state.pageDetails.pageid);
    Linking.openURL(
      'https://en.wikipedia.org/?curid=' + this.state.pageDetails.pageid,
    );
  };

  _onGetSuggestionsPressed = () => {
    console.log('You tapped _onGetSuggestionsPressed!');
    console.log(this.state.pageDetails.pageid);
    console.log(
      this.state.currentMarker.lat + ',' + this.state.currentMarker.lon,
    );
    this.getDirections(
      this.state.latitude + ',' + this.state.longitude,
      this.state.currentMarker.lat + ',' + this.state.currentMarker.lon,
    );
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
        <View style={{flex: 3}}>
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
                key={marker.pageid}
                coordinate={{
                  latitude: marker.lat,
                  longitude: marker.lon,
                }}
                title={marker.title}
                onPress={() => this._onMarkerPressed(marker)}
              />
            ))}
            <MapView.Polyline
              coordinates={this.state.coords}
              strokeWidth={2}
              strokeColor="red"
            />
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
        <View style={{flex: 2}}>
          <Text>{this.state.titleText}</Text>
          <Text>{this.state.descriptionText}</Text>
          <Button
            style={{flex: 2}}
            title="Wikipedia"
            onPress={this._onWikipediaPressed}
          />
          <Button
            style={{flex: 2}}
            title="Get Suggestions"
            onPress={this._onGetSuggestionsPressed}
          />
          <FlatList
            data={this.state.routes}
            renderItem={({item}) => (
              <View>
                <Text>{item.legs[0].distance.text}</Text>
                <Button
                  title={item.legs[0].duration.text}
                  onPress={() => this._onRoutePressed(item)}
                />
              </View>
            )}
            keyExtractor={({id}, index) => id}
          />
        </View>
      </View>
    );
  }
}
