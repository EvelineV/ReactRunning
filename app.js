var React = require('react');
var ReactDOM = require('react-dom');

var kmph = function(seconds,distance){
    return Math.round(100*3600*(distance/seconds))/100;
}

var displayTime = function(seconds){
    /* convert time in seconds to hh:mm:ss */
    let hours = Math.floor(seconds/3600);
    let secondsMinusHours = seconds - hours*3600;
    let minutes = Math.floor(secondsMinusHours/60);
    let remainingSeconds = secondsMinusHours - minutes*60;
    if (minutes < 10){minutes = String('0'+minutes);}
    remainingSeconds = Math.round(remainingSeconds);
    if (remainingSeconds < 10){remainingSeconds = String('0'+remainingSeconds);}
    let display = '';
    if (hours > 0){
        display = String(hours+":"+minutes+":"+remainingSeconds);
    } else{
        display = String(minutes+":"+remainingSeconds);
    }
    return display;
}

var calculatePace = function (distance, time, split){
    /*fills the table, still needs split calculation*/
    let timestr = String(time);
    let add = 0;
    let hours = 0;
    if(timestr.length > 5){
        add = 3;
        hours = Number(timestr.substring(0,2));
    }
    let minutes=Number(timestr.substring(0+add,2+add));
    let seconds=Number(timestr.substring(3+add,5+add));
    let totalSeconds = seconds + 60*(minutes + 60*hours);
    let meanPace = totalSeconds/distance;
    let meanKMH = kmph(totalSeconds,distance);
    if(distance==0){ meanPace = 0; meanKMH=0;}
    let splitFactor = 1+(split/100); //negative split ends the race faster.
    //console.log(splitFactor);
    var pacing = [];
    var cumulative = 0;
    var cumulativeTime = 0;
    var splitPace = 0; 
    for(var mark = 0; mark <= distance; mark++){
        splitPace = meanPace; // (*splitFactor, implement later)
        cumulativeTime = meanPace*mark;
        pacing.push({mark: mark, cumulativeTime: displayTime(cumulativeTime), splitPace: displayTime(splitPace)});
    }
    if(distance - Math.floor(distance) > 0.001 && distance > 0){
        console.log(mark+' '+distance);
        splitPace = meanPace;
        cumulativeTime = meanPace*distance;
        pacing.push({mark: distance, cumulativeTime: displayTime(cumulativeTime), splitPace: displayTime(splitPace)});
        pacing.push({splitPace: '(tail: '+displayTime(splitPace*(distance-mark+1))+')'})
    }
    //console.log(pacing);
    return {meanPace: displayTime(meanPace), meanKMH: meanKMH, pacing: pacing};
}

class Header extends React.Component {
    render () {
        return (
            <header>
                <h1>{this.props.title}</h1>
            </header>
        );
    }
};


class PacingChart extends React.Component{
    render(){
        var passes = this.props.data.map((pacing)=>{
            return (
                <tr key={pacing.mark}>
                    <td>{pacing.mark}</td>
                    <td>{pacing.cumulativeTime}</td>
                    <td>{pacing.splitPace}</td>
                </tr>
            );
        });
        console.log(passes);
        return (
            <table>
                <thead>
                <tr>
                    <th> km </th>
                    <th> Time </th>
                    <th> Pace </th>
                </tr>
                </thead>
                <tbody>{passes}</tbody>
            </table>
        );
    };
};

class PaceCalculator extends React.Component{
    constructor(props){
        super(props);
        this.state = {distance: this.props.distance, time: this.props.time, split: this.props.split};
        this.distanceChange = this.distanceChange.bind(this);
        this.timeChange = this.timeChange.bind(this);
        this.splitChange = this.splitChange.bind(this);
    }
    distanceChange(event) {
        this.setState({distance: event.target.value});
    }
    timeChange(event) {
        this.setState({time: event.target.value});
    }
    splitChange(event) {
        this.setState({split: event.target.value});
    }
    render () {
        var pace = calculatePace(this.state.distance, this.state.time, this.state.split);
        var meanPace = pace.meanPace;
        var meanKMH = pace.meanKMH;
        var pacing = pace.pacing;
        return (
            <div className="content">
                <div className="form">
                    <div className="row">
                        <label className="gr-3 gr-6@mobile">Distance (km) </label>
                        <input type="text" className="gr-3 gr-6@mobile" value={this.state.distance} onChange={this.distanceChange}/>
                    </div>
                    <div className="row">
                        <label className="gr-3 gr-6@mobile">Finish time ((hh:)mm:ss) </label>
                        <input type="text" className="gr-3 gr-6@mobile" value={this.state.time} onChange={this.timeChange}/>
                    </div>
                    <div className="row">
                        <label className="gr-3 gr-6@mobile">Split (percent) </label>
                        <input type="text" className="gr-3 gr-6@mobile" value={this.state.split} onChange={this.splitChange}/>
                    </div>
                </div>
                <h2>Mean Pace: <span className="meanpace">{meanPace}</span></h2>
                <h2>Mean Speed: <span className="meankmh">{meanKMH}</span> km/h</h2>
                <PacingChart data={pacing}/>
            </div>
        );
    }
};

PaceCalculator.defaultProps = {"distance": 5, "time": "00:25:00", "split": -1};

class App extends React.Component{
    render() {
        return (
            <div>
                <Header title="React Pacing Calculator"/> {/* could also put defaultprops here as distance="10" etc*/}
                <PaceCalculator />
                <h3> To Do and sources:</h3>
                <ul>
                    <li>Calculate splits!</li>
                    <li><del>Take care of non-integer distances (marathon!)</del></li>
                    <li>Hot compile/load CSS</li>
                    <li><del>CSS grid</del></li>
                    <li>Github demo site</li>
                    <li><del>Screens: mobile and desktop</del></li>
                    <li><del>Put in default props </del></li>
                    <li><a href="http://www.runnersworld.com/race-training/learn-how-to-run-negative-splits">Explanation of negative splits</a></li>
                    <li><a href="http://ccoenraets.github.io/es6-tutorial-react/setup/">ReactJS tutorial.</a></li>
                    <li><a href="https://www.jonathan-petitcolas.com/2015/05/15/howto-setup-webpack-on-es6-react-application-with-sass.html">Webpack tutorial</a></li>
                    <li></li>
                </ul>
            </div>
        );
    }
};

//ReactDOM.render(React.createElement(App, {"distance":10,"time":"00:45:00","split":0}), document.getElementById('app'));
ReactDOM.render(<App/>,  document.getElementById("app"));