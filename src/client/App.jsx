import React from 'react';
import { hot } from 'react-hot-loader';
import styles from './style.scss';
import moment from 'moment';

let localStorage = [];

//-----------------IMPORT COMPONENTS---------------------
import Listener from './components/listener/listener';
import ItemList from './components/itemList/itemList';
import DoneList from './components/doneList/doneList';


//-----------------SPEECH RECOGNITION SETUP---------------------

const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.continous = true
recognition.interimResults = true
recognition.lang = 'en-US'

//------------------------COMPONENT-----------------------------

class App extends React.Component {

    constructor() {
        super();
        this.state = {
          recording: false,
          listening: false,
          interimText: "",
          finalText: "",
          editing: false,
          todoList:[
            {
                text: "Hi this is first attempt",
                created_at: "4 Sep 2019, 5:29 pm",
                updated_at: "4 Sep 2019, 5:29 pm",
                checked: false
            },
            {
                text: "second attempt",
                created_at: "5 Sep 2019, 12:29 pm",
                updated_at: "5 Sep 2019, 12:29 pm",
                checked: false
            }
          ]
        };
        this.toggleListen = this.toggleListen.bind(this)
        this.handleListen = this.handleListen.bind(this)
        this.checkItem = this.checkItem.bind(this);
        this.editItem = this.editItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
    }

    componentDidMount() {
    console.log(window.localStorage)
    localStorage = JSON.parse(window.localStorage.getItem('todoList'));
    this.setState({todoList: localStorage});
  }

    toggleListen() {
        this.setState({listening: !this.state.listening}, this.handleListen)
    }

    handleListen(){
        console.log('listening?', this.state.listening);

        // recognition.onstart = () => {
        //   console.log("Start Listening!")
        // }

        if (this.state.listening) {
          recognition.start()
          recognition.onend = () => {
            console.log("...user is pausing, continue listening...")
            recognition.start();
          }
        } else {
          recognition.stop()
          recognition.onend = () => {
            console.log("Stopped listening by click")
            let todoList = this.state.todoList
            todoList.push({
                text: this.state.finalText,
                created_at: moment().format('DD MMM YYYY, h:mm a')
            })
            this.setState({todoList: todoList, finalText:""}, () => {
                window.localStorage.setItem("todoList", JSON.stringify(this.state.todoList))
            })
          }
        }

        let finalTranscript = '';

        recognition.onresult = event => {
            let interimTranscript = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                let transcript = event.results[i][0].transcript
                if (event.results[i].isFinal){
                    finalTranscript += transcript + ' '
                } else {
                    interimTranscript += transcript
                }

                let transcriptArr = finalTranscript.split(' ')


                let ariaIndex;

                if (transcriptArr.includes("hello")) {
                    console.log(transcriptArr)
                    let helloIndex = transcriptArr.lastIndexOf("hello")
                    ariaIndex = helloIndex+2
                    let startCmd = transcriptArr.slice(helloIndex, ariaIndex)
                    if (startCmd[0] === 'hello' && startCmd[1] === 'Aria'){
                        let recordedText = transcriptArr.slice(ariaIndex).join(' ')
                        console.log(recordedText)
                        this.setState({interimText:interimTranscript, finalText:recordedText, recording:true})
                        console.log('recording?', this.state.recording)
                    }
                }

                let stopCmd = transcriptArr.slice(-3, -1)

                if (stopCmd[0] === 'goodbye' && stopCmd[1] === 'Aria'){
                    //recognition.stop()
                    recognition.onend = () => {
                        console.log('Stopped recording by voice command')
                        let finalText = transcriptArr.slice(ariaIndex, -3).join(' ')
                        let todoList = this.state.todoList
                        todoList.push({
                            text: finalText,
                            created_at: moment().format('DD MMM YYYY, h:mm a')
                        })
                        this.setState({finalText:"", recording: false, todoList: todoList}, () => {
                            console.log("msg saved", this.state.listening, this.state.recording);
                            window.localStorage.setItem("todoList", JSON.stringify(this.state.todoList))
                            this.handleListen();
                        } )
                        // ls.set({todoList: todoList})
                    }
                }
            }
        }
    }

    checkItem(index) {
        let todoList = this.state.todoList;
        if(todoList[index].checked) {
            todoList[index].checked = false
        }
        else {
            todoList[index].checked = true;
        }
        this.setState({todoList: todoList});
    }

    editItem(index){
        let list = this.state.todoList;
        if (!this.state.editing) {
            list[index].editing = true;
            this.setState({
                todoList: list,
                todoItem: list[index].text,
                editing: true
            });
        }
        else {
            if (list[index].editing) {
                list[index].editing = false;
                this.setState({
                    todoList: list,
                    todoItem: "",
                    editing: false
                });
            }
        }
    }

    updateItem(event,index,word) {
        event.preventDefault();
        let list = this.state.todoList;
        list[index].text = word;
        list[index].updated_at = moment().format('DD MMM YYYY, h:mm a');
        list[index].editing = false;
        this.setState({
            todoList: list,
            editing: false
        });
    }

    removeItem(index) {
        let list = this.state.todoList;
        list.splice(index, 1);
        this.setState({todoList: list});
    }


  render() {


    return (
      <div className={styles.container}>
        <Listener
            recording = {this.state.recording}
            interimText = {this.state.interimText}
            finalText = {this.state.finalText}
            toggleListen = {this.toggleListen}>
        </Listener>
        <ItemList
            todoList = {this.state.todoList}
            checkItem = {this.checkItem}
            editItem = {this.editItem}
            updateItem = {this.updateItem}
            removeItem = {this.removeItem}>
        </ItemList>
        <DoneList
            todoList = {this.state.todoList}
            checkItem = {this.checkItem}
            editItem = {this.editItem}
            updateItem = {this.updateItem}
            removeItem = {this.removeItem}>
        </DoneList>
      </div>
    );
  }
}


export default hot(module)(App);