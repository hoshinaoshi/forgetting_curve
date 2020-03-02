import * as React from 'react';
import { Alert, Button, Picker, TextInput, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
import * as SQLite from "expo-sqlite";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import RNPickerSelect from 'react-native-picker-select';
import RNDatePicker from 'react-native-datepicker';
import { MonoText } from '../components/StyledText';
import moment from "moment";

const DB = SQLite.openDatabase("aaaaaaaaaaaaaaaaa")

export default class TaskScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      titles: [],
      title_id: null,
      title: "",
      memorization_date: moment().format("YYYY-MM-DD"),
      content_name: "",
    };
  }

  async componentDidMount() {
    const outerThis = this
    DB.transaction(tx => {
      tx.executeSql("select * from titles",[], function(tx, res) {
        let array = []
        res.rows._array.forEach(r => {
          array.push({key: array.length, value: r.id, label: r.name})
        });
        outerThis.setState({titles: array})
      })
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
  async _register(){
    const outerThis = this
    if(this.state.title_id == null){
      if(this.state.title){
        DB.transaction(function(txn) {
          txn.executeSql("insert into titles (name, status) values (?, 0);", [outerThis.state.title], function(tx, res) {
            txn.executeSql("insert into tasks (title_id, memorization_date, content_name,  status) values (?, ?, ?, 0);", [res.insertId, outerThis.state.memorization_date, outerThis.state.content_name], function(tx, res) {
            });
          });
        });
      } else {
        Alert.alert("タイトルを入力してください")
      }
    } else {
      DB.transaction(function(txn) {
        txn.executeSql("insert into tasks (title_id, memorization_date, content_name,  status) values (?, ?, ?, 0);", [outerThis.state.title_id, outerThis.state.memorization_date, outerThis.state.content_name], function(tx, res) {
        });
      });
    }
  }
  render(){
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>タイトル</Text>
        <Text style={styles.text}>タイトルを新規作成</Text>
        <TextInput
          style={styles.textInput}
          placeholder="学習対象のタイトルを入力"
          onChangeText={text => this._onChangeTitle(text)}
          value={this.state.title}
        />
        <Text style={styles.text}>既存タイトルから設定</Text>
        <RNPickerSelect
          style={{ inputIOS: styles.picker, inputAndroid: styles.picker}}
          value={this.state.title_id}
          placeholder={{value: null, label: "タイトルの選択", color: "black"}}
          onValueChange={(itemValue) => this._onChangeTitleList(itemValue)}
          items={this.state.titles}
        />
        <Text style={styles.titleText}>記憶を開始した日付</Text>
        <RNDatePicker
          customStyles={{
            dateInput: {
              flex: 1,
              borderWidth: 0,
              borderColor: 'white',
              alignItems: 'flex-start',
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
        <Text style={styles.titleText}>内容</Text>
        <TextInput
          style={{...styles.textInput, height: 200, borderWidth: 1, borderColor: "lightgray"}}
          multiLine={true}
          placeholder="学習内容のメモを入力"
          onChangeText={text => this._onChangeContentName(text)}
          value={this.state.content_name}
        />
        <Button
          title="登録"
          onPress={() => this._register()}
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
    paddingHorizontal: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 8,
  },
  text:{
    marginVertical: 4,
  },
  textInput: {
    height: 40,
    borderColor: "gray",
  },
  picker: {
    paddingVertical: 8,
  },
});
