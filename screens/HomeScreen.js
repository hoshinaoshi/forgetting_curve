import * as React from 'react';
import { FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
import * as SQLite from "expo-sqlite";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import { MonoText } from '../components/StyledText';
import moment from "moment";

const DB = SQLite.openDatabase("aaaaaaaaaaaaaaaaa")

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      allTasks: [],
      selectedDate: moment().format("YYYY-MM-DD")
    };
  }
  componentDidMount() {
    DB.transaction(tx => {
      tx.executeSql(
        "create table if not exists titles (id integer primary key not null, name text not null, status integer not null);", // 実行したいSQL文
        null, // SQL文の引数
        () => {console.log('success1')}, // 成功時のコールバック関数
        () => {console.log('fail1')} // 失敗時のコールバック関数
      );
    },
      () => {console.log('fail2')}, // 失敗時のコールバック関数
      () => {console.log('success2')} // 成功時のコールバック関数
    )
    
    DB.transaction(tx => {
      tx.executeSql(
        "create table if not exists tasks (id integer primary key not null, title_id integer not null, memorization_date text not null, content_name text not null, status integer not null);", // 実行したいSQL文
        null, // SQL文の引数
        () => {console.log('success3')}, // 成功時のコールバック関数
        () => {console.log('fail3')} // 失敗時のコールバック関数
      );
    },
      () => {console.log('fail4')}, // 失敗時のコールバック関数
      () => {console.log('success4')} // 成功時のコールバック関数
    )

    const outerThis = this
    DB.transaction(tx => {
      tx.executeSql("select ta.id, t.name, ta.memorization_date, ta.content_name from tasks ta, titles t where t.id = ta.title_id ",[], function(tx, res) {
        let tasks = []
        let allTasks = []
        const format = "YYMM";
        const thisMonth = moment().format(format);
        res.rows._array.forEach(obj => {
          const data = { key: tasks.length, id: obj.id, title: obj.name, memorization_date: obj.memorization_date, content_name: obj.content_name}
          allTasks.push(data)
          if(thisMonth == moment(obj.memorization_date).format(format)){
            tasks.push(data)
          }
        });
        outerThis.setState({tasks: tasks})
        outerThis.setState({allTasks: allTasks})
      })
    },
      () => {console.log('fail')},
      () => {console.log('success')}
    )
  }
  _markedDates(){
    let markedDates = {}
    this.state.allTasks.forEach(task => {
      markedDates[task.memorization_date] = { marked: true}
    });
    console.log(this.state.selectedDate)
    markedDates[this.state.selectedDate] = {selected: true}
    return markedDates
  }
  _onDayPress(day){
    let tasks = []
    this.state.allTasks.forEach(task => {
      if(task.memorization_date == day.dateString){
        tasks.push(task)
      }
    });
    this.setState({tasks: tasks})
    this.setState({selectedDate: day.dateString})
  }
  _onMonthChange(month){
    const format = "YYMM";
    let tasks = []
    this.state.allTasks.forEach(task => {
      if(moment(task.memorization_date).format(format) == moment(month.dateString).format(format)){
        tasks.push(task)
      }
    });
    this.setState({tasks: tasks})
  }
  render(){
    return (
      <View style={styles.container}>
        <CalendarList
          ref={ref=>this.calendar=ref}
          markedDates={this._markedDates()}
          horizontal={true}
          pagingEnabled={true}
          // Initially visible month. Default = Date()
          //current={'2012-03-01'}
          // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
          minDate={undefined}
          // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
          maxDate={undefined}
          // Handler which gets executed on day press. Default = undefined
          onDayPress={(day) => {this._onDayPress(day)}}
          // Handler which gets executed on day long press. Default = undefined
          //onDayLongPress={(day) => {console.log('selected day', day)}}
          // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
          monthFormat={'yyyy年MM月'}
          // Handler which gets executed when visible month changes in calendar. Default = undefined
          scrollEnabled={false}
          onVisibleMonthsChange={(month) => this._onMonthChange(month[0])}
          // Hide month navigation arrows. Default = false
          hideArrows={false}
          // Replace default arrows with custom ones (direction can be 'left' or 'right')
          //renderArrow={(direction) => (<Arrow/>)}
          // Do not show days of other months in month page. Default = false
          hideExtraDays={false}
          // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
          // day from another month that is visible in calendar page. Default = false
          disableMonthChange={false}
          // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
          firstDay={1}
          // Hide day names. Default = false
          hideDayNames={false}
          // Show week numbers to the left. Default = false
          showWeekNumbers={false}
          // Handler which gets executed when press arrow icon left. It receive a callback can go back month
          //onPressArrowLeft={substractMonth => this.calendar.addMonth(-1)}
          // Handler which gets executed when press arrow icon right. It receive a callback can go next month
          //onPressArrowRight={addMonth => addMonth()}
          // Disable left arrow. Default = false
          disableArrowLeft={false}
          // Disable right arrow. Default = false
          disableArrowRight={false}
        />
        <FlatList
          data={this.state.tasks}
          keyExtractor={item => String(item.key)}
          renderItem={({item}) =>
          <View style={{...styles.container, padding: 16, borderTopWidth: 1, borderColor: "lightgray"}}>
            <View style={styles.innerContainer}>
              <Text>{item.memorization_date}</Text>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <Text style={styles.content_name}>{item.content_name}</Text>
          </View>
          }
        />
      </View>
    );
  }
}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: '#fff',
  },
  title: {
    marginLeft: 8,
    fontWeight: "bold"
  },
  content_name: {
    padding: 4
  }
});
