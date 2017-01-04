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
    remainingSeconds = Math.round(remainingSeconds);
    if (remainingSeconds === 60){remainingSeconds = 0; minutes += 1;}
    if (minutes === 60){minutes = 0; hours += 1;}
    if (remainingSeconds < 10){remainingSeconds = String('0'+remainingSeconds);}
    if (minutes < 10){minutes = String('0'+minutes);}
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
    //parse
    let timestr = String(time);
    time = time.split(':');
    if (time.length < 3){
        var hours = 0;
        var minutes = Number(time[0]);
        var seconds = Number(time[1]);
    }
    else{
        var hours = Number(time[0]);
        var minutes = Number(time[1]);
        var seconds = Number(time[2]);
    }
    let totalSeconds = seconds + 60*(minutes + 60*hours);
    let meanPace = totalSeconds/distance;
    let meanKMH = kmph(totalSeconds,distance);
    if(distance==0){ meanPace = 0; meanKMH=0;}
    // compute
    let splitFactor = 1+(split/100); //negative split ends the race faster.
    let t_one_numerator = 0
    let tail = distance - Math.floor(distance);
    for (var k = 1; k <= distance; k++){
        t_one_numerator += Math.pow(splitFactor, k/(distance-1))
    }
    if(tail > 0.001 && distance > 0){
        t_one_numerator += splitFactor*tail;
    }
    var pacing = [];
    var cumulativeTime = 0;
    var splitPace = totalSeconds/t_one_numerator; 
    pacing.push({mark: 0, cumulativeTime: displayTime(cumulativeTime), splitPace: displayTime(0)});
    for(var mark = 1; mark <= Math.floor(distance); mark++){
        // no splits implementation
        // splitPace = meanPace; 
        // splits implementation
        splitPace = splitPace * Math.pow(splitFactor, 1/(distance-1));
        cumulativeTime += splitPace;
        pacing.push({mark: mark, cumulativeTime: displayTime(cumulativeTime), splitPace: displayTime(splitPace)});
    }
    if(tail > 0.001 && distance > 0){
        // no splits
        //splitPace = meanPace;
        //cumulativeTime = meanPace*distance;
        // splits implementation
        splitPace = splitPace * Math.pow(splitFactor, tail/(distance-1));
        cumulativeTime += splitPace*tail;
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
            </div>
        );
    }
};

//ReactDOM.render(React.createElement(App, {"distance":10,"time":"00:45:00","split":0}), document.getElementById('app'));
ReactDOM.render(<App/>,  document.getElementById("app"));
