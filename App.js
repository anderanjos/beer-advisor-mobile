import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import axios from 'axios';
import Voice from 'react-native-voice';
import Tts from 'react-native-tts';
const _backendEndpoint = 'https://beer-advisor-orchestrator-1.herokuapp.com';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: '',
            status: '',
            userPayload: '',
            userSession: '',
        };

        Voice.onSpeechStart = this.onSpeechStartHandler;
        Voice.onSpeechEnd = this.onSpeechEndHandler;
        Voice.onSpeechResults = this.onSpeechResultsHandler;
        // Tts.setDefaultLanguage('pt-BR');
    }

    componentWillMount() {
        this.getSession();
    }

    /**
     * Get Watson session
     */
    getSession = async () => {
        const response = await axios.get(
            `${_backendEndpoint}/api/session`,
            this.state.userPayload,
        );
        this.init(response.data);
    };

    /**
     * Greeting when assistant is ready
     */
    init = async session => {
        try {
            const initialPayload = {
                input: {
                    message_type: 'text',
                    text: '',
                },
            };
            let response = await axios.post(`${_backendEndpoint}/api/message`, {
                ...initialPayload,
                ...session,
            });
            Tts.speak(response.data.output.generic[0].text);

            // deve responder aqui
            this.setState({ userSession: session });
            this.setState({ text: response.data.output.generic[0].text });
            this.setState({ userPayload: response.data });
        } catch (err) {
            console.log('Failed to retrive data from Watson API', err);
        }
    };

    // Handle voice capture event
    onSpeechResultsHandler = result => {
        this.setState({ text: result.value[0] });
        this.sendMessage(result.value[0]);
    };

    // Listening to start
    onSpeechStartHandler = () => {
        this.setState({ status: 'Listening...' });
    };

    // Listening to end
    onSpeechEndHandler = () => {
        this.setState({ status: 'Voice Processed' });
    };

    // Listening to press button to speak
    onStartButtonPress = e => {
        Voice.start('pt-BR');
    };

    // Listening to release button to speak
    onStopButtonPress = async e => {
        Voice.stop();
        Tts.stop();
    };

    /**
     * send message to Watson
     */
    sendMessage = async payload => {
        try {
            let { userSession } = this.state;
            let inputPayload = {
                input: {
                    message_type: 'text',
                    text: payload,
                },
            };

            let responseData = { ...inputPayload, ...userSession };
            let response = await axios.post(
                `${_backendEndpoint}/api/message`,
                responseData,
            );
            this.setState({ text: response.data.output.generic[0].text });
            Tts.speak(response.data.output.generic[0].text);
        } catch (err) {
            console.log('Failed to send data to Watson API', err);
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>Welcome to Beer Advisor!</Text>

                <TouchableHighlight
                    style={{
                        borderColor: 'black',
                        borderWidth: 1,
                        width: 100,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    underlayColor={'gray'}
                    onPressIn={e => this.onStartButtonPress(e)}
                    onPressOut={e => this.onStopButtonPress(e)}>
                    <Text>Talk</Text>
                </TouchableHighlight>

                <Text style={{ fontSize: 20, color: 'red' }}>{this.state.text}</Text>
                <Text style={{ fontSize: 20, color: 'blue' }}>{this.state.status}</Text>
            </View>
        );
    }
}
export default App;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        padding: 20,
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
});
