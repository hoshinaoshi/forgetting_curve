import * as React from 'react';
import { Button, Picker, TextInput, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
import * as SQLite from "expo-sqlite";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import RNPickerSelect from 'react-native-picker-select';
import RNDatePicker from 'react-native-datepicker';

import { MonoText } from '../components/StyledText';

export default class TaskScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      titles: [],
      title_id: null,
      title: "",
      memorization_date: "",
      content_name: "",
    };
  }

  componentDidMount() {
    const db = SQLite.openDatabase("aaaaaaaaaaaaaaaaa")
    db.transaction(tx => {
      tx.executeSql(
        'select * from titles',
        null,
        (_, { rows: { array } }) => {this.setState({ttitles: array})} // 第2パラメータに格納されているクエリの結果から取得した配列(_array)を、stateに格納する
      )
    },
      () => {console.log('fail')},
      () => {console.log('success')}
    )
  }
  _onChangeTitle(title){
    this.setState({title: title})
  }
  _onChangeTitleList(title_id){
    this.setState({title_id: title_id})
  }
  _onDateChange(memorization_date){
    this.setState({memorization_date: memorization_date})
  }
  _onChangeContentName(content_name){
    this.setState({content_name: content_name})
  }
  render(){
    return (
      <View style={styles.container}>
        <Text>タイトル</Text>
        <Text>タイトルを新規作成</Text>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={text => this._onChangeTitle(text)}
          value={this.state.title}
        />
        <Text>既存タイトルから設定</Text>
        <RNPickerSelect
          useNativeAndroidPickerStyle={false}
          style={{flex: 1, width: undefined, height: 32}}
          value={this.state.title_id}
          placeholder={{value: null, label: "タイトルの選択", color: "black"}}
          onValueChange={(itemValue) => this._onChangeTitleList(itemValue)}
          items={this.state.titles}
        />
        <Text>記憶を開始した日付</Text>
        <RNDatePicker
          customStyles={{
            dateInput: {
              flex: 1,
              borderWidth: 0,
              borderColor: 'white',
              alignItems: 'flex-end',
              justifyContent: 'center'
            },
          }}
          date={this.state.memorization_date}
          mode="date"
          format="YYYY-MM-DD"
          minDate="2010-01-01"
          maxDate="2030-01-01"
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          androidMode="spinner"
          showIcon={false}
          onDateChange={(memorization_date) => this._onDateChange(memorization_date)}
          placeholder={"2020-01-01"}
        />
        <Text>内容</Text>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
          onChangeText={text => this._onChangeContentName(text)}
          value={this.state.content_name}
        />
        <Button
          title="Press me"
          onPress={() => console.log("登録")}
        />
      </View>
    );
  }
}

TaskScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
