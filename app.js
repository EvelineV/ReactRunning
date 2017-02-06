var React = require('react');
var ReactDOM = require('react-dom');

var kmph = function(seconds,distance){
    return Math.round(100*3600*(distance/seconds))/100;
}

var displayTime = function(seconds){
    /* convert time in seconds to hh:mm:ss (for display only) */
    let hours = Math.floor(seconds/3600);
    let secondsMinusHours = seconds - hours*3600;
    let minutes = Math.floor(secondsMinusHours/60);
    let remainingSeconds = Math.round(secondsMinusHours - minutes*60);
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

var computeTotalSeconds = function(time){
    /* Time calculations */
    time = time.split(':');
    let hours, minutes, seconds;
    if (time.length < 3){
        hours = 0;
        minutes = Number(time[0]);
        seconds = Number(time[1]);
    }
    else{
        hours = Number(time[0]);
        minutes = Number(time[1]);
        seconds = Number(time[2]);
    }
    let totalSeconds = seconds + 60*(minutes + 60*hours);
    return totalSeconds-1;
}

var calculatePace = function (distance, time, split, interval){
    /* compute some easy values */   
    const totalSeconds = computeTotalSeconds(time);
    let meanPace = totalSeconds/distance;
    let meanKMH = kmph(totalSeconds, distance);
    if(distance===0){ meanPace = 0; meanKMH=0;}
    /* compute split parameters */
    interval = Math.floor(interval);
    if(interval < 2){ interval=1; }  
    let checkpoints = [];
    const splitFactor = 1+(split/100);
    let t_one_numerator = 0
    for (let k = 1; k <= interval; k++){
        t_one_numerator += Math.pow(splitFactor, k/(interval-1));
        checkpoints.push(k*distance/interval);
    }
    checkpoints.push(distance);
    /* start iteration */
    let pacing = [];
    let cumulativeTime = 0;
    let kmtime = 0;
    let kmpace = 0;
    let splitPace = totalSeconds/t_one_numerator; 
    let splitList = [splitPace];
    pacing.push({mark: 0.00, cumulativeTime: displayTime(cumulativeTime), kmPace: displayTime(0), splitPace: displayTime(0)});
    for(let k = 0; k < checkpoints.length; k++){
        let mark = checkpoints[k];
        splitPace = splitPace * Math.pow(splitFactor, 1/(interval-1));
        splitList.push(splitPace);
        cumulativeTime += splitPace;
        pacing.push({mark: Number(mark).toFixed(2), cumulativeTime: displayTime(cumulativeTime), splitPace: displayTime(splitPace)});        
    }
    for(let mark = 1; mark <= distance; mark++){
        for(let k = 0; k <= checkpoints.length; k++){
            if(parseFloat(checkpoints[k]) > parseFloat(mark)){
                splitPace = splitList[k+1];
                break;
            }
        }
        kmtime += splitPace/(distance/interval);
        kmpace = splitPace/(distance/interval);
        pacing.push({mark: mark.toFixed(2), cumulativeTime: displayTime(kmtime), kmPace: displayTime(kmpace), splitPace: displayTime(splitPace)});
    }
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
        let passes = this.props.data.map((pacing)=>{
            return (
                <tr key={pacing.mark} className={(pacing.mark > Math.floor(pacing.mark) ? 'non-km-mark': '')}>
                    <td>{pacing.mark}</td>
                    <td>{pacing.cumulativeTime}</td>
                    <td>{pacing.kmPace}</td>
                    <td>{pacing.splitPace}</td>
                </tr>
            );
        });
        return (
            <table>
                <thead>
                <tr>
                    <th> km </th>
                    <th> Time </th>
                    <th> KM Pace </th>
                    <th> Interval Pace </th>
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
        this.state = {distance: this.props.distance, time: this.props.time, split: this.props.split, interval: this.props.interval };
        this.distanceChange = this.distanceChange.bind(this);
        this.timeChange = this.timeChange.bind(this);
        this.splitChange = this.splitChange.bind(this);
        this.intervalChange = this.intervalChange.bind(this);
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
    intervalChange(event) {
        this.setState({interval: event.target.value});
    }
    render () {
        let pace = calculatePace(this.state.distance, this.state.time, this.state.split, this.state.interval);
        let meanPace = pace.meanPace;
        let meanKMH = pace.meanKMH;
        let pacing = pace.pacing;
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
                    <div className="row">
                        <label className="gr-3 gr-6@mobile"># Intervals </label>
                        <input type="text" className="gr-3 gr-6@mobile" value={this.state.interval} onChange={this.intervalChange}/>
                    </div>
                </div>
                <h2>Mean Pace: <span className="meanpace">{meanPace}</span></h2>
                <h2>Mean Speed: <span className="meankmh">{meanKMH}</span> km/h</h2>
                <PacingChart data={pacing}/>
            </div>
        );
    }
};

PaceCalculator.defaultProps = {"distance": 5.0, "time": "00:25:00", "split": -1, "interval": 2};

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
