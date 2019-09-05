import React from 'react';
import styles from './style.scss';
import moment from 'moment';

//-----------------SPEECH RECOGNITION SETUP---------------------

const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.continous = true
recognition.interimResults = true
recognition.lang = 'en-US'

//------------------------COMPONENT-----------------------------

class Todo extends React.Component {
    constructor() {
        super();
        this.state = {
          listening: false,
          interimText: "",
          finalText: "",
          todoList:[
            {
                text: "Hi this is first attempt",
                created_at: "4 Sep 2019, 5:29 pm",
                updated_at: "4 Sep 2019, 5:29 pm"
            }
          ]
        };
        this.toggleListen = this.toggleListen.bind(this)
        this.handleListen = this.handleListen.bind(this)
    }

    toggleListen() {
        this.setState({listening: !this.state.listening}, this.handleListen)
    }


    handleListen(){
        console.log('listening?', this.state.listening);

        if (this.state.listening) {
          recognition.start();
          recognition.onend = () => {
            console.log("...user is pausing, continue listening...")
            recognition.start();
          };
        } else {
          recognition.stop();
          recognition.onend = () => {
            console.log("Stopped listening by click")
          }
        }

        recognition.onstart = () => {
          console.log("Start Listening!")
        }


            let finalTranscript = '';

        recognition.onresult = event => {
        let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                let transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal){
                    finalTranscript += transcript + ' '
                } else {
                    interimTranscript += transcript
                }
                this.setState({interimText:interimTranscript, finalText:finalTranscript})
                let transcriptArr = finalTranscript.split(' ');
                let stopCmd = transcriptArr.slice(-3, -1);

                if (stopCmd[0] === 'stop' && stopCmd[1] === 'listening'){
                    recognition.stop();
                    recognition.onend = () => {
                        console.log('Stopped listening by voice command');
                        let finalText = transcriptArr.slice(0, -3).join(' ')
                        let todoList = this.state.todoList;
                        todoList.push({
                            text: finalText,
                            created_date: moment().format('DD MMM YYYY, h:mm a')
                        });
                        this.setState({finalText:finalText, listening: false, todoList: todoList})
                    }
                }
            }
        }
    }

  render() {
        let listItems = this.state.todoList.map((item, index) => {
            return (
                <p key={index}> • <input type="checkbox" /> {item.text} <br/> <small>{item.created_date}</small> </p>
            )
        })

    return (
        <div>
            <button style={{background: this.state.listening? "Salmon" : "lightblue"}}id='microphone-btn' className={styles.button} onClick={this.toggleListen}>Listen</button>
            <div className={styles.interim}>{this.state.interimText}</div>
            <div className={styles.final}>{this.state.finalText}</div>
            <div>
                {listItems}
            </div>

        </div>
    );
  }
}


export default Todo;