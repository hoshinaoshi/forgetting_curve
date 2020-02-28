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
          monthFormat={'yyyy MM'}
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
          <View>
            <Text>{item.title}</Text>
            <Text>{item.memorization_date}</Text>
            <Text>{item.content_name}</Text>

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

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use useful development
        tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/workflow/development-mode/');
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/get-started/create-a-new-app/#making-your-first-change'
  );
}

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
