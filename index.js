
/* EURIKLIS */
/*
1.Euriklis type:
*/
var euriklis = Euriklis = EURIKLIS = (typeof exports === "undefined") ? (function euriklis() { }) : (exports);
if (typeof global !== "undefined") { global.euriklis = euriklis; }
euriklis.version = '1.01';
/*
2.The promise type:
*/
euriklis.promise =
	function promise(fn) {
		var state = 'pending';
		var value;
		var deferred = null;

		function resolve(newValue) {
			if (newValue && typeof newValue.then === 'function') {
				newValue.then(resolve, reject);
				return;
			}
			state = 'resolved';
			value = newValue;

			if (deferred) {
				handle(deferred);
			}
		}

		function reject(reason) {
			state = 'rejected';
			value = reason;

			if (deferred) {
				handle(deferred);
			}
		}

		function handle(handler) {
			if (state === 'pending') {
				deferred = handler;
				return;
			}

			var handlerCallback;

			if (state === 'resolved') {
				handlerCallback = handler.onResolved;
			} else {
				handlerCallback = handler.onRejected;
			}

			if (!handlerCallback) {
				if (state === 'resolved') {
					handler.resolve(value);
				} else {
					handler.reject(value);
				}

				return;
			}

			var ret = handlerCallback(value);
			handler.resolve(ret);
		}

		this.then = function (onResolved, onRejected) {
			return new promise(function (resolve, reject) {
				handle({
					onResolved: onResolved,
					onRejected: onRejected,
					resolve: resolve,
					reject: reject
				});
			});
		};

		fn(resolve, reject);
	};
euriklis.promise.all = function (arr) {
	'use strict';
	let len = arr.length;
	let k = 0, res_arr = [];
	let bind = (k) => {
		return arr[k]().then(res => {
			res_arr.push(res);
			++k;
			return k < len ? bind(k) : res_arr;
		})
	}
	return bind(k);
}

euriklis.call = function (result_f, reject_f) {
	return new euriklis.promise(function (resolve, reject) {
		(result_f) ? resolve(result_f) : reject(reject_f);
	});
}
euriklis.neuron = function (name, inputs, outputs) {
	/**
	 * the inputs is an array 1 x n array that
	 * gets the input neutrons.
	 */
	this.name = name;
	this.inputs = inputs;
	this.outputs = outputs;
	this.function = eval(name);
	if (this.outputs) {
		if (this.outputs.every(el => el.constructor === euriklis.neuron)) {
			this.execute(el);
		} else this.out(el);
	}
	return 0;
}
euriklis.neuron.prototype.define = function (name, nfunction) {
	euriklis.neutron.name(name).function = nfunction;
}
euriklis.nrerror = function nrerror(errMsg) { throw new Error(errMsg); };
euriklis.data = new Object();
/*
 The section data of the euriklis library requires jquery 
 to work correctly. Those functions provide the list of all
 sp500 indexed companies,infirmation for one or more stocks
 and information  for  all sp500 stocks. You can filter the
 stocks  such  that  if  for  any  date  information is not 
 available to be shown only those data sets, who have comp-
 lete information, or to repeat  the previous  infirmation. 
 */
(function (exports) {
	api_key = "4TR2_k9dockL9oyoxK3a";
	/*var getJSON = function (url) {
		return new euriklis.promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open('get', url, true);
			xhr.responseType = 'json';
			xhr.onload = function () {
				var status = xhr.status;
				if (status == 200) {
					resolve(xhr.response);
				} else {
					reject(status);
				}
			};
			xhr.send();
		});
	};*/
	/*function getJSON(url) {
		return new euriklis.promise(function (resolve, reject) {
			var jsonFile = $.getJSON(url,
				function (result) { return result }).fail(function (jqXHR, textStatus, errorThrown) { return textStatus; });
			resolve(jsonFile);
		});
	}*/
	function getJSON(url) {
		return new euriklis.promise((resolve, reject) => {
			var request = require("request"), result = {};
			var jsonFile = request({
				url: url,
				json: true
			}, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					resolve(body);
				} else reject(error);
			});

		})
	}
	function openModalWindow() {
		$('body').prepend(
			'<div id="openedModal" class="modalDialogOpen">' +
			'<div id = "includeContent1">' +
			'<a title="Close" class="close">X</a>' +
			'<div id = "modalContent1"></div>' +
			'</div>' +
			'</div>');
		$('#openedModal .close').click(function () {
			$('#openedModal').remove();
		});
		return d3.select('#openedModal #modalContent1');
	}
	function openModalWindow1() {
		return "function openModalWindow() {" +
			"$('body').prepend(" +
			"'<div id=\"openedModal\" class=\"modalDialogOpen\">' +" +
			"'<div id = \"includeContent1\">' +" +
			"'<a title=\"Close\" class=\"close\">X</a>' +" +
			"'<div id = \"modalContent1\"></div>' +" +
			"'</div>'" +
			"'</div>');" +
			"$('#openedModal .close').click(function () {" +
			"$('#openedModal').remove();" +
			"});" +
			"return d3.select('#openedModal #modalContent1');" +
			"}";
	}
	function allCompaniesOfSP500() {
		var SANDP500_stocks =
			"http://data.okfn.org/data/core/s-and-p-500-companies/r/constituents.json";
		return getJSON(SANDP500_stocks).
			then(function (data) {
				var array = [];
				$.each(data, function (i, e) { array.push(e); });
				return array;
				//return data;
			},
				function (status) {
					return 'Something went wrong.';
				}).
			then(function (res) { console.log(res); return res; }, function (rej) { console.log(rej); return rej; });
	}
	var frequency = { 'd': 'daily', 'm': 'monthly', 'q': 'quarterly', 'y': 'annual' };
	// corresponds to the parameter "collapse" of the json file!
	var stockParameters_WIKI = {
		'Date': 0, 'Open': 1, 'High': 2, 'Low': 3,
		'Close': 4, 'Volume': 5, 'Ex-Dividend': 6,
		'Split Ratio': 7, 'Adj. Open': 8, 'Adj. High': 9,
		'Adj. Low': 10, 'Adj. Close': 11, 'Adj. Volume': 12
	};
	function Quootes_WIKI(Symbol, parameter, freq, startDate, endDate, transformData) {
		return new euriklis.promise(function (response, reject) {
			var Quotes_WIKI_fn = function (Symbol, parameter, freq, startDate, endDate, transformData) {
				transformData = typeof (transformData) == 'undefined' ? 'null' : transformData;
				alert(transformData);
				return "https://www.quandl.com/api/v3/datasets/WIKI/" + Symbol +
					".json?column_index=" + stockParameters_WIKI[parameter] +
					"&order=asc&collapse=" + frequency[freq] +
					"&start_date=" + '"' + startDate + '"' +
					"&end_date=" + '"' + endDate + '"' +
					'&transform=' + transformData +
					"&api_key=4TR2_k9dockL9oyoxK3a";
			}
			var QW = Quotes_WIKI_fn(Symbol, parameter, freq, startDate, endDate, transformData);
			response(QW);
		});
	}
	function Get_information__for_concrete_stock(Symbol, parameter, freq, startDate, endDate, transformData) {
		return Quootes_WIKI(Symbol, parameter, freq, startDate, endDate, transformData).
			then(function (res) { return getJSON(res); }).
			then(function (data) {
				var array = new Array();
				$.each(data, function (i, e) { array[i] = e; });
				return array.dataset;
			}).
			then(function (res) {
				var i, new_res = {};
				new_res.code = res.dataset_code;
				new_res.name = res.name;
				new_res.from_date = res.start_date;
				new_res.to_date = res.end_date;
				new_res.transform = res.transform;
				new_res.database = res.database_code;
				new_res.data = [];
				for (i = 0; i < res.data.length; i++) {
					new_res.data[i] = {};
					new_res.data[i]['date'] = res.data[i]["0"];
					new_res.data[i][parameter] = res.data[i]['1'];
				}
				new_res.modifiedData = {};
				for (i = 0; i < res.data.length; i++) {
					new_res.modifiedData[res.data[i]["0"]] = res.data[i]["1"];
				}

				//new_res[parameter] = res.data["1"];
				var st_dt_data;
				if (res.data[0] != null) {
					st_dt_data = new Date(res.data[0][0]);
				}
				else { st_dt_data = new Date(startDate); };
				var input_dates = [new Date(startDate), new Date(endDate)];
				var output_dates = [new Date(res.start_date), new Date(res.end_date)];
				if (input_dates[0].getTime() < output_dates[0].getTime() ||
					input_dates[1].getTime() > output_dates[1].getTime() ||
					(st_dt_data.getYear() > input_dates[0].getYear())) {
					new_res = "error inputting of the Dates!";
				}
				return new_res;
			},
				function (rej) {
					var rejectMessage, jsonrej = JSON.parse(rej.responseText);
					if (jsonrej.error) { rejectMessage = jsonrej.error; }
					else {
						if (jsonrej.errors) { rejectMessage = jsonrej.errors; }
						else { rejectMessage = jsonrej; }
					}
					return jsonrej;
				}).
			then(function (res) {
				return new euriklis.promise(function (resolve, reject) {
					var rejection;
					if (res != "error inputting of the Dates!" && !(res.error || res.errors)) { resolve(res); }
					if (res == "error inputting of the Dates!" || res.error || res.errors && res.status != 200) { reject(res); }
				});
			});
	}
	function Get_information_for_few_stocks(Symbols, parameter, freq, startDate, endDate, transformData) {
		var RESULT = function () { return new euriklis.promise(function (resolve, reject) { var res = {}; resolve(res); }); }
		RESULT = RESULT();
		var RE = 'RESULT';
		for (i = 0; i < Symbols.length; i++) {
			RE += '.then(function(result0){return Get_information__for_concrete_stock(Symbols[' +
				i + '],parameter,freq,startDate,endDate,transformData).then(function(result1){result0[Symbols[' +
				i + ']] = result1;return result0;},function(reject1){return result0;});})';
		}
		RESULT = eval(RE);
		return RESULT;
	}
	Get_all_sp500_stocks_for_a_period = function (parameter, freq, startDate, endDate, transformData) {
		return allCompaniesOfSP500().
			then((res) => {
				var arr = new Array();
				for (i = 0; i < res.length; i++) {
					if (res[i].Symbol === 'BRK-B') { arr.push('BRK_B'); }
					else {
						if (res[i].Symbol === 'BF-B') {
							arr.push('BF_B');
						}
						else {
							if (res[i].Symbol === 'GOOG') {
								arr.push('GOOGL');
							}
							else {
								arr.push(res[i].Symbol);
							}
						}
					}
				}
				return arr;
			})
			.then((res) => {
				return Get_information_for_few_stocks(res, parameter, freq, startDate, endDate, transformData);
			});
	}
	function quandlSearchUrl(word, database, page) {
		var page = page || 1,
			database = database || '""',
			httpUrl = "https://www.quandl.com/api/v3/datasets.json?query=";
		return new euriklis.promise((resolve, reject) => {
			httpUrl += word;
			httpUrl += "&database_code=";
			httpUrl += database;
			httpUrl += "&page=";
			httpUrl += page;
			httpUrl += "&api_key=";
			httpUrl += api_key;
			if (word || word !== "") resolve(httpUrl);
			else reject("The word argument is not defined!");
		})
	};
	function quandlQuickSearchUrl(word, database, page) {
		var page = page || 1,
			database = database || '""',
			httpUrl = "https://www.quandl.com/api/v3/datasets.json?query=";
		return new euriklis.promise((resolve, reject) => {
			httpUrl += word;
			httpUrl += "&database_code=";
			httpUrl += database;
			httpUrl += "&per_page=1";
			httpUrl += "&page=";
			httpUrl += page;
			httpUrl += "&api_key=";
			httpUrl += api_key;
			if (word || word !== "") resolve(httpUrl);
			else reject("The word argument is not defined!");
		})
	};
	function currentResult() {
		return new euriklis.promise((resolve, reject) => {
			var res = {};
			resolve(res);
		});
	}
	function getPage(word, database, page) {
		return quandlSearchUrl(word, database, page).
			then((res) => { return getJSON(res); },
				(rej) => {
					return rej;
				});
	}
	function quandlSearch(word, database) {
		return getPage(word, database, 1).then(page1 => {
			var _page_, n = page1.meta.total_pages;
			var searchResults = 'currentResult()';
			for (_page_ = 1; _page_ <= n; _page_++) {
				searchResults += '.then((cr) => {' +
					'return getPage(word,database,' + _page_ + ').' +
					'then((_gp_) => {' +
					'cr[' + (_page_ - 1) + '] = _gp_.datasets[' + (_page_ - 1) + '];' +
					'return cr' +
					'});' +
					'})';
			}
			searchResults = eval(searchResults);
			return searchResults;
		})
			.then(searchResults => {
				searchResults = new Array().concat.apply(new Array(), searchResults);
				return searchResults;
			});
	}
	function tabulate(data, columns) {
		data = JSON.parse(JSON.stringify(data));
		var tr = 'tr',
			td = 'td',
			th = 'th',
			pcenter = '.resp center',
			restb = '.restb:last-child',
			table = function (class_name) { return '<table class ="' + class_name + '"' + '></table>'; };
		var p = d3.select(el)
			.append('p').attr('class', 'resp');
		p.append('center')
		function app_table(app_tb_link, class_name, data) {
			p.select(app_tb_link).append('table').attr('class', class_name);
			p.select(restb).append('thead');
			p.select(restb).append(tr);
			function complete_table(data) {
				if (data === null) {
					data = 'null';
				} else {
					if (data === true) {
						data = 'true';
					} else {
						if (data === false) {
							data = 'false';
						}
					}
				}
				if (data.constructor === String || typeof data === 'number') {
					p.select('.restb:last-child').select('tr:last-child').append(td);
					if (data.consttructor === Boolean && data === true) {
						p.select('.restb:last-child').select('tr:last-child').select('td:last-child').text("true");
					} else {
						if (data.constructor === Boolean && data === false) {
							p.select('.restb:last-child').select('tr:last-child').select('td:last-child').text("false");
						} else {
							if (data === null) {
								p.select('.restb:last-child').select('tr:last-child').select('td:last-child').text("null");
							} else {
								p.select('.restb:last-child').select('tr:last-child').select('td:last-child').text(data);
							}
						}
					}
					//$(restb).append(tr);
				} else {
					if (data.constructor === Array) {
						var i, n = data.length;
						for (i = 0; i < n; i++) {
							complete_table(data[i]);
							//$(restb).append(tr);
						}
						p.select(restb).append(tr)
					} else {
						var keys = Object.keys(data);
						var kl = keys.length, key;
						for (key = 0; key < kl; key++) {
							if (data[keys[key]] === null) {
								data[keys[key]] = 'null';
							} else {
								if (data[keys[key]] === true) {
									data[keys[key]] = 'true';
								} else {
									if (data[keys[key]] === false) {
										data[keys[key]] = 'false';
									}
								}
							}
							if (data[keys[key]].constructor === String || typeof data[keys[key]] === 'number') {
								p.select('.restb:last-child').select('tr:last-child').append(td);
								p.select('.restb:last-child').select('tr:last-child').select('td:last-child').text(keys[key]);
								p.select('.restb:last-child').select('tr:last-child').append(td);
								p.select('.restb:last-child').select('tr:last-child').select('td:last-child').text(data[keys[key]]);
								p.select(restb).append(tr);
							} else {
								if (data[keys[key]].constructor === Array) {
									p.select('.restb:last-child').select('tr:last-child').append(td);
									p.select('.restb:last-child')
										.select('tr:last-child')
										.select('td:last-child')
										.attr('colspan', data[keys[key]].length)
										.text(keys[key]);
									p.select(restb).append(tr);
									complete_table(data[keys[key]]);
								} else {
									p.select('.restb:last-child').select('tr:last-child').append(td);
									p.select('.restb:last-child').select('tr:last-child').select('td:last-child').attr('colspan', 2).text(keys[key]);
									p.select(restb).append(tr);
									//$('.restb:last tr:last').append(td);
									app_table('.restb:last-child tr:last-child td:last-child', keys[key], data[keys[key]]);
								}
							}
						}
					}
				}
				p.select(restb).style('background-color', 'rgb(255,153,51)');
				p.selectAll('.restb').selectAll('td').style('background-color', 'white');
				// $('.restb:first').css({'background-color':'red'})
			}
			return complete_table(data);
		}
		return app_table(pcenter, 'restb', data);
	}
	function getDataFromDatabase(symbol, database, frequency, start_date, end_date, column_index, show_as, transform) {
		/* 
		 the frequency argument have to get the follow values:
		 --> daily
		 --> monthly
		 --> quarterly
		 --> annual
		 */
		var questionMark = '?';
		column_index = (column_index) || "";
		frequency = frequency === 'annual' || frequency === 'monthly' || frequency === 'daily' ?
			frequency : 'annual';
		frequency = 'collapse=' + frequency;
		transform = (transform) || 'null';
		var httpUrl = "https://www.quandl.com/api/v3/datasets/" +
			database + '/' + symbol + '.json' + questionMark + 'column_index=' + column_index + '&' +
			'start_date=' + start_date + '&' + 'end_date=' + end_date + '&' + frequency + '&' +
			'transform=' + transform + '&' + 'api_key=' + api_key;
		return getJSON(httpUrl)
			.then(data => {
				show_as = show_as || null;
				if (show_as !== null) {
					if (show_as === 'text' || show_as === 'show as text') {
						d3.select(resultsSpace).select('#readyResults')
							.append('p').text(JSON.stringify(data));
					} else {
						if (show_as === 'table' || show_as === 'show as table') {
							tabulate(data.dataset);
						}
					}
				}
				return data;
			});
	}
	function getMultipleDataFromDatabase(datasets, databases, frequency, startDate, endDate, column, show_as, transform) {
		return new euriklis.promise((resolve, reject) => {
			if (datasets.constructor === Array && databases.constructor === Array) {
				var i, curres = 'currentResult()';
				for (i = 0; i < datasets.length; i++) {
					var columni = column.constructor === Array ? column[i] : column;
					curres += '.then(result => {' +
						'return getDataFromDatabase(datasets[' + i + '],' +
						'databases[' + i + '],' +
						'frequency,' +
						'startDate,' +
						'endDate,' +
						columni + ',' +
						'null,' +
						'transform)' +
						'.then(data_i => {' +
						'result["' + datasets[i] + '"] = data_i.dataset;' +
						'return result;' +
						'})' +
						'})'
				}
				resolve(eval(curres));
			} else {
				reject(euriklis.nrerror('The datasets or databases parameters are not correct!'));
			}
		})
			.then(data => {
				var ml = [], _x = [], x = [], i, j, y = [];
				for (i in data) {
					_x.push(data[i].data);
				}
				for (j = 0; j < datasets.length; j++) {
					for (i = 0; i < _x[j].length; i++) {
						x[i] = [];
						y[i] = [];
					}
				}
				for (j = 0; j < datasets.length; j++) {
					for (i = 0; i < _x[j].length; i++) {
						x[i][j] = _x[j][i][1];
						y[i][j] = _x[j][i][0];
					}
				}
				data.summary = x;
				data.dates = y;
				return data;
			})
			.then(data => {
				show_as = show_as || null;
				if (show_as !== null) {
					if (show_as === 'text' || show_as === 'show as text') {
						d3.select(resultsSpace).select('#readyResults')
							.append('p').text(JSON.stringify(data));
					} else {
						if (show_as === 'table' || show_as === 'show as table') {
							tabulate(data);
						}
					}
				}
				return data;
			});
	}
	function getDataFromMultipleDatabases(dataset, databases, frequency, start_date, end_date, column, show_as, transform) {

	}
	function error_data() {
		var omw = openModalWindow().append('table');
		var omwt = omw.append('tbody').append('tr');
		omwt.append('td').style('width', '15%').style('height', '15%').append('img').attr('src', 'images/no_results.jpg')
			.style('width', '100%').style('height', '20%');
		omwt.append('td').append('center').append('b').text('This dataset do not exist!!!');
	}
	function quick_search(data, database, page) {
		return quandlQuickSearchUrl(data, database, page)
			.then((res) => {
				return getJSON(res)
					.then(res => {
						return new euriklis.promise((resolve, error) => {
							if (typeof res.datasets[0] !== 'undefined') {
								var dt = res.datasets[0];
								dt.total_pages = res.meta.total_pages;
								resolve(dt);
							} else error(error_data());

						})
					}, rej => { return rej; });
			},
				(rej) => {
					return rej;
				});
	}
	function plotLinechart(x, ys, y_names_arr, title, type_data, other_args) {
		var i, type_data = type_data || 'ordinal',
			y_names_arr = y_names_arr || euriklis.Mathematics.createMatrix(1, ys);
		var title = title || '';
		var other_args = other_args || null;
		d3.select('#readyResults')
			.append('center')
			.append('div')
			.attr('id', 'linechart')
			.style('width', '800')
			.style('height', '350')
			.style('margin-top', '100');
		linechart = document.getElementById('linechart');
		if (x.constructor === Array) x = x.toMatrix();
		else {
			if (x.constructor !== euriklis.Mathematics.Matrix) euriklis.nrerror('The x - data is not available!');
		}
		if (ys.constructor === Array) ys = ys.toMatrix();
		else {
			if (ys.constructor !== euriklis.Mathematics.Matrix) euriklis.nrerror('The y - data is not available!');
		}
		if (type_data === 'ordinal') {
			if (x.columns !== 1) {
				euriklis.nrerror('The x - data is not correct included!');
			} else {
				x = x.transpose().M[0];
				ys = ys.transpose();
			}
		} else {
			if (type_data !== 'row') euriklis.nrerror('Your data has not correct type!');
			if (x.rows !== 1) euriklis.nrerror('The x - data is not correct included!');
			x = x.M[0];
		}
		for (i = 0; i < ys.rows; i++) {
			var trace = {
				x: x,
				y: ys.M[i],
				name: y_names_arr[i]
			}
			if (other_args !== null) {
				$.extend(trace, other_args);
			}
			Plotly.plot(linechart, [trace], { title: title });
		}
	}
	function plotPiechart(title, values, labels, other_args) {
		d3.select('#readyResults')
			.append('center')
			.append('div')
			.attr('id', 'piechart')
			.style('width', '800')
			.style('height', '350')
			.style('margin-top', '100');
		var i, piechart = document.getElementById('piechart');
		if (values.constructor === Array) values = values.toMatrix();
		else {
			if (values.constructor !== euriklis.Mathematics.Matrix) euriklis.nrerror('The type of values argument is not correctly insided!');
		}
		if (title.constructor !== String) euriklis.nrerror('The title argument is not correctly included!');
		if (other_args) {
			if (other_args.constructor !== Object) euriklis.nrerror('The other args argumeent is not correctly included!');
		}
		for (i = 0; i < values.rows; i++) {
			if (values.columns !== labels.length) euriklis.nrerror('The labels argument is not correctly included!');
			var data = {
				values: values.M[i],
				labels: labels,
				type: 'pie'
			}
			$.extend(data, other_args)
			Plotly.plot(piechart, [data], { title: title })
		}
	}
	function getDatasetAndDatabaseCode(word, database, page) {
		page = page || 1;
		var data_package = {};
		return quick_search(word, database, page).then(result => {
			var modal_window = openModalWindow();
			var tableInModalWindow = modal_window.append('table');
			var tbHead = tableInModalWindow.append('thead');
			tbHead.append('tr').append('th').attr('colspan', 2).text('Results from searching:');
			var tbody_mod_window = tableInModalWindow.append('tbody');
			var tbody_tr_1 = tbody_mod_window.append('tr');
			tbody_tr_1.append('td').text('dataset code:');
			tbody_tr_1.append('td').text(result.dataset_code);
			var tbody_tr_2 = tbody_mod_window.append('tr');
			tbody_tr_2.append('td').text('database code:');
			tbody_tr_2.append('td').text(result.database_code);
			var tbody_tr_3 = tbody_mod_window.append('tr');
			tbody_tr_3.append('td').text('name:');
			tbody_tr_3.append('td').text(result.name);
			var tbody_tr_freq = tbody_mod_window.append('tr');
			tbody_tr_freq.append('td').text('frequency:');
			tbody_tr_freq.append('td').text(result.frequency);
			var tbody_tr_available_dates = tbody_mod_window.append('tr');
			tbody_tr_available_dates.append('td').text('available dates:');
			tbody_tr_available_dates
				.append('td').text(result.oldest_available_date + ' - ' + result.newest_available_date);
			var tbody_tr_premium = tbody_mod_window.append('tr');
			tbody_tr_premium.append('td').text('Is free?');
			tbody_tr_premium.append('td').text(result.premium === false ? 'Yes' : 'No');
			var tbody_tr_4 = tbody_mod_window.append('tr');
			tbody_tr_4.append('td').text('select page:');
			tbody_tr_4.append('td').append('input').attr('id', 'page_number');
			$('#page_number').val(page);
			var tbody_tr_5 = tbody_mod_window.append('tr');
			tbody_tr_5.append('td').attr('colspan', 2).append('center')
				.append('b').text('Is it the result that you want?');
			var center = modal_window.append('center');
			center.append('button').attr('id', 'yes_btn').text('Yes');
			center.append('button').attr('id', 'no_btn').text('No');
			$('#yes_btn').click(function () {
				data_package = result;
				$('#openedModal').remove();
				var openModalWindow2 = openModalWindow();
				var name_var_tb = openModalWindow2.append('table');
				var name_var_thead = name_var_tb.append('thead').append('tr')
					.append('th').attr('colspan', 2).text('Select name of the variable:');
				var name_var_tr = name_var_tb.append('tbody').append('tr');
				name_var_tr.append('td').text('variable name:');
				name_var_tr.append('td').append('input').attr('id', 'name_var_obj');
				openModalWindow2.append('button').attr('id', 'submit_name_val').style('display', 'block')
					.style('margin', '2% auto').text('Input');
				$('#submit_name_val').click(function () {
					var name_val = $('#name_var_obj').val();
					name_val === '' ? 'data_package' : name_val;
					var incl_val = $('#includeVar').val() + '\n';
					$('#includeVar').val(incl_val + 'var ' + name_val + ' = ' + JSON.stringify(data_package));
				});
			});
			$('#no_btn').click(function () {
				if (parseInt($('#page_number').val()) === page) page += 1;
				else page = parseInt($('#page_number').val());
				$('#openedModal').remove();
				return getDatasetAndDatabaseCode(word, database, page);
			});
		});
	}
	function _getDatasetAndDatabaseCode_(word, database, page) {
		page = page || 1;
		var data_package = {};
		return quick_search(word, database, page).then(result => {
			var modal_window = openModalWindow();
			var tableInModalWindow = modal_window.append('table');
			var tbHead = tableInModalWindow.append('thead');
			tbHead.append('tr').append('th').attr('colspan', 2).text('Results from searching:');
			var tbody_mod_window = tableInModalWindow.append('tbody');
			var tbody_tr_1 = tbody_mod_window.append('tr');
			tbody_tr_1.append('td').text('dataset code:');
			tbody_tr_1.append('td').text(result.dataset_code);
			var tbody_tr_2 = tbody_mod_window.append('tr');
			tbody_tr_2.append('td').text('database code:');
			tbody_tr_2.append('td').text(result.database_code);
			var tbody_tr_3 = tbody_mod_window.append('tr');
			tbody_tr_3.append('td').text('name:');
			tbody_tr_3.append('td').text(result.name);
			var tbody_tr_freq = tbody_mod_window.append('tr');
			tbody_tr_freq.append('td').text('frequency:');
			tbody_tr_freq.append('td').text(result.frequency);
			var tbody_tr_available_dates = tbody_mod_window.append('tr');
			tbody_tr_available_dates.append('td').text('available dates:');
			tbody_tr_available_dates
				.append('td').text(result.oldest_available_date + ' - ' + result.newest_available_date);
			var tbody_tr_premium = tbody_mod_window.append('tr');
			tbody_tr_premium.append('td').text('Is free?');
			tbody_tr_premium.append('td').text(result.premium === false ? 'Yes' : 'No');
			var tbody_tr_4 = tbody_mod_window.append('tr');
			tbody_tr_4.append('td').text('select page:');
			tbody_tr_4.append('td').append('input').attr('id', 'page_number');
			$('#page_number').val(page);
			var tbody_tr_5 = tbody_mod_window.append('tr');
			tbody_tr_5.append('td').attr('colspan', 2).append('center')
				.append('b').text('Is it the result that you want?');
			var center = modal_window.append('center');
			center.append('button').attr('id', 'yes_btn').text('Yes');
			center.append('button').attr('id', 'no_btn').text('No');
			return result;
		})
			.then(result => {
				return new euriklis.promise((resolve, reject) => {
					$('#yes_btn').click(function () {
						for (prop in result) { data_package[prop] = result[prop]; }
						$('#openedModal').remove();
						resolve(data_package);
					});
					$('#no_btn').click(function () {
						if (parseInt($('#page_number').val()) === page) page += 1;
						else page = parseInt($('#page_number').val());
						$('#openedModal').remove();
						resolve(_getDatasetAndDatabaseCode_(word, database, page));
					});
				});
			});
	}
	function getDatasetsFromDatabases(words, databases, page) {
		var i, current_datasets_package = currentResult().then(obj_result => {
			return quick_search('a').then(pseudo_result => {
				for (prop in pseudo_result) obj_result[prop] = [];
				return obj_result;
			});
		});
		var curr_dts_pack = 'current_datasets_package()';
		for (i = 0; i < words.length; i++) {
			curr_dts_pack += '.then(curr_dtsets => {' +

				'})'
		}
	}
	function datToJSON(url, header, options) {
		'use strict';
		const fs = require('fs');
		header = typeof header !== "undefined" ? header : false;
		options = options || null;
		let tbl;
		tbl = fs.readFileSync(url, 'utf-8')
		let tblarr = Array.from({ length: tbl.split('\n').length - 1 })
			.map((el, i) => {
				el = tbl.split('\n')[i];
				el = el.split(' ');
				el = el.filter(val => (val != "" && val != " "))
				el = el.map(elem => {
					elem = elem.endsWith('\,') ? elem.substring(0, elem.length - 1) : elem;
					elem = elem[0] === '\,' ? elem.substring(1) : elem;
					return elem;
				})
				el = el.map(elem => elem.endsWith("\r") ?
					elem = elem.substring(0, elem.length - 1) :
					elem.substring(0, 2) === "\r" ? elem = emem.substring(1, elem.length) : elem = elem)
				return el
			})
		let result = {};
		if (header) {
			result.header = tblarr[0];
			result.data = tblarr.slice(1)
		} else {
			result.header = null;
			result.data = tblarr;
		}
		if (options) {
			const o = options;
			if (o.setElement) {
				if (o.setElement.f) {
					result.data[o.setElement.index] = o.setElement.f(result.data, o.setElement.index);
				} else {
					if (o.setElement.expression) {
						result.data[o.setElement.index] = o.setElement.expression;
					}
				}
			}
			o.numeric = typeof o.numeric === "boolean" ? o.numeric : false;
			if (o.numeric) {
				result.data.map(el => el = Number(el))
			}
			if (o.setElements) {
				if (o.setElements && typeof o.setElements === 'function') {
					result.data = result.data.map(o.setElements)
				}
			}
		}
		return result;
	}
	function setDat(url, header, opt) {
		'use strict';
		let fs = require('fs');
		let dh = datToJSON(url, header) // data and header
		let mdh = opt.set(dh); //modified data and header
		fs.writeFileSync(opt.fname, mdh, 'utf-8');
	}
	/**
	 * Get Leontief Matrices from
	 * http://www.wiod.org
	 */
	function createInputOutputMatrix(options) {
		'use strict';
		let country = options.country,
			year = options.year;
		const xlsx = require("xlsx"),
			request = require("request"),
			fs = require('fs');
		/**
		 * get the xslsb document from 
		 * http://www.wiod.org
		 */
		return new euriklis.promise(function (resolve, reject) {
			let httpRequest = '', fileExtensionD = '';
			/**
			 * rewrite the country to be safe 
			 */

			let country = options.country;
			if (year >= 2000) {
				httpRequest += 'http://www.wiod.org/protected3/data16/wiot_ROW/WIOT' +
					year +
					'_Nov16_ROW.xlsb';
				fileExtensionD = '.xlsb'
			} else {
				if (year >= 1995 && year < 2000) {
					httpRequest += "http://www.wiod.org/protected3/data13/wiot_analytic/wiot" +
						parseInt(year - 1900) +
						"_row_apr12.xlsx";
					fileExtensionD = '.xlsx';
				} else reject(euriklis.nrerror("Do not exists data for this period."));
			}
			request
				.get(httpRequest)
				.on('error', function (err) {
					reject(err);
				})
				.pipe(fs.createWriteStream('wiod' + year + fileExtensionD))
				.on('finish', function (err, data) {
					if (err) reject(err);
					let wb = xlsx.readFile('wiod' + year + fileExtensionD),
						ws = wb.Sheets[wb.SheetNames[0]], wd = {};
					/**
					 * The data (wd object) will contains
					 * the matrix as it is (not the Leontief!)
					 * withought the totals I/O for every cluster in
					 * the IO key and the row/column names of the 
					 * clusters (i.e. agriculture, services, idustry...). 
					 * If you want tot get the specified matrix with
					 * the imports from clusters from other countries
					 * you need to specify the program with the argument
					 * specify : true
					 */
					/**
					 * read the column 'D' of the sheet and if the 
					 * first cell value is "AUS", then you are in 
					 * the correct direction. Otherwise search in 
					 * the previous columns and in the next columns and if 
					 * do not exists then throw error that remarks 
					 * that the country is not found.   
					 */
					const get_the_value_of_cell = (currentCell) => {
						if (currentCell.special) return ws[currentCell.special].v;
						else if (currentCell.c && currentCell.r) {
							return ws[xlsx.utils.encode_cell({ c: currentCell.c, r: currentCell.r })].v;
						} else euriklis.nrerror("incorrect declaration of the cell.");
					}, read_D7 = get_the_value_of_cell({ special: "D7" }),
						maxRow = xlsx.utils.decode_cell(ws['!ref'].split(':')[1]).r + 1,
						testXlsxDocument = () => {
							/**
							 * this function tests if the document is
							 * correct and if the excel file contains 
							 * the IO tables and returns the encoded 
							 * coordinates (i.e D7) of the first country.
							 */
							let state = "begin", i = 3, j = 2, cv = '', ans, ccell = { r: 6, c: 3 };
							while (state) {
								switch (state) {
									case "begin":
										cv = read_D7;
										if (cv === 'AUS') state = "correct"
										else state = "search better"
										break;
									case "correct":
										ans = { countryCellStart: "D7", message: "This documents is normal and is of type 2000+ wiod." }
										state = 0;
										break;
									case "search better":
										cv = get_the_value_of_cell({ special: 'C7' });
										if (cv === 'AUS') state = "correct but probably deprecated model";
										else {
											ccell = { r: 6, c: 2 }
											state = "search by rows"
										}
										break;
									case "correct but probably deprecated model":
										ans = { countryCellStart: 'C7', message: state }
										state = 0
										break;
									case "search by rows":
										if (get_the_value_of_cell(ccell) === "r1") state = "correct but starts with other country"
										else state = "search by columns"
										break;
									case "correct but starts with other country":
										ans = {
											countryCellStart: xlsx.utils.decode_cell({ c: ccell.c - 1, r: ccell.r }),
											message: "This document is " + state + '. Usually the tableus starts with AUS.'
										};
										state = 0;
										break;
									case "search by columns":
										if (get_the_value_of_cell(ccell) === "r1") state = "correct but starts with other country"
										else {
											if ((i === 10 && j === 7) || i > maxRow - 1) state = "error"
											else {
												if (i > 10 && j < 8) {
													i = 3;
													j += 1;
												}
												ccell = { r: i, c: j }
												cv = get_the_value_of_cell(ccell);
												state = "search by rows"
												i += 1;
											}
										}
										break;
									case "error":
										state = 0;
										ans = { "error": "This document probably do not contains Input-Output tabels from WIOD site." }
										break;
								}
							}
							return ans;
						},
						findCountryAddress = () => {
							const fc = testXlsxDocument().countryCellStart;
							let fcdc = xlsx.utils.decode_cell(fc),
								ans, state = "begin", addRow = 0;
							while (state) {
								switch (state) {
									case "begin":
										if (country === get_the_value_of_cell(fcdc)) {
											state = "get dimension of the table"
										} else {
											if (addRow === maxRow) state = "Do not exists data for this country"
											else {
												fcdc = { r: fcdc.r + 1, c: fcdc.c }
												state = "begin";
											}
										}
										break;
									case "get dimension of the table":
										++addRow;
										if (country === get_the_value_of_cell({ r: fcdc.r + addRow, c: fcdc.c })) {
											state = "get dimension of the table";
										} else state = "dimension was got";
										break;
									case "dimension was got":
										ans = { address: fcdc, dimension: addRow - 1 }
										state = 0;
										break;
									case "Do not exists data for this country":
										ans = { "error": state }
										state = 0;
										break;
								}
							}
							return ans;
						}
					let fca = findCountryAddress(), address, dim,
						ca1 = xlsx.utils.decode_cell(testXlsxDocument().countryCellStart);
					if (!fca.error) {
						address = fca.address;
						dim = fca.dimension;
					}
					else reject(fca.error);
					/**
					 * Construction of the IO table:
					 */
					let i, j, iot = [], clusters_iot = [];
					for (i = 0; i < dim; i++) {
						iot[i] = [];
						/**
						  * construct the names/labels of the clusters:
						  */
						clusters_iot.push(get_the_value_of_cell({
							c: address.c - 1,
							r: address.r + i
						}));
						for (j = 0; j < dim; j++) iot[i][j] = get_the_value_of_cell({
							c: address.c + address.r - ca1.r + j + 2,
							r: address.r + i
						});
					}
					resolve({ IO: iot.toMatrix(), clusters: clusters_iot, country: country, year: year })
				})
		})
	}
	/**
	 * country asociation of
	 * wiod site
	 */
	wiodCountries = (country) => {
		"use strict";

		const countriesCatalog = {
			"Australia": "AUS",
			"Austria": "AUT",
			"Belgium": "BEL",
			"Brazil": "BRA",
			"Bulgaria": "BGR",
			"Canada": "CAN",
			"China": "CHN",
			"Cyprus": "CYP",
			"Czech Republic": "CZE",
			"Denmark": "DNK",
			"Estonia": "EST",
			"Finland": "FIN",
			"France": "FRA",
			"Germany": "DEU",
			"Greece": "GRC",
			"Hungary": "HUN",
			"India": "IND",
			"Indonesia": "IDN",
			"Ireland": "IRL",
			"Italy": "ITA",
			"Japan": "JPN",
			"Korea": "KOR",
			"Latvia": "LVA",
			"Lithuania": "LTU",
			"Luxembourg": "LUX",
			"Malta": "MLT",
			"Mexico": "MEX",
			"Netherlands": "NLD",
			"Poland": "POL",
			"Portugal": "PRT",
			"Romania": "ROU",
			"Russia": "RUS",
			"Slovak Republic": "SVK",
			"Slovenia": "SVN",
			"Spain": "ESP",
			"Sweden": "SWE",
			"Taiwan": "TWN",
			"Turkey": "TUR",
			"United Kingdom": "GBR",
			"United States": "USA"
		},
			countriesAsArray = Object.keys(countriesCatalog),
			countryAbbreviationsAsArray = Object.keys(countriesCatalog)
				.map((key) => { return countriesCatalog[key] })
		if (countriesCatalog[country]) return {
			country: country,
			abbreviation: countriesCatalog[country]
		}
		else {
			if (countryAbbreviationsAsArray.indexOf(country) > -1) return {
				country: countriesAsArray.find(key => countriesCatalog[key] === country),
				abbreviation: country
			}
			else return { Error: "The country that you would like to search do not exists!" }
		}
	};
	/**
	 * get the global value chain
	 * from the http://www.wiod.org ...
	 */
	function GVC(options) {
		"use strict";
		let year = +options.year,
			dataset = options.dataset;
		if (typeof dataset === "undefined") dataset = 2016
		if (isNaN(year)) throw new Error("Incorrect year input.")
		const xlsx = require("xlsx"),
			request = require("request"),
			fs = require('fs');
		let urlPart1 = "http://www.wiod.org/protected3/data",
			urlPart2_13 = '13/wiot_analytic/wiot',
			urlPart3_13 = '_row_apr12.xlsx',
			urlPart2_16 = "16/wiot_ROW/WIOT",
			urlPart3_16 = "_Nov16_ROW.xlsb",
			dataset13 = [2013, '2013', 'October2013', 'October13', 'Oct13', 'Oct2013'],
			dataset16 = [2016, '2016', 'November2016', 'Nov2016', 'November16', 'Nov16'],
			url = '', fileExtension = '', fileExtension13 = '.xlsx', fileExtension16 = '.xlsb';
		if (dataset13.some(ds => ds === dataset)) {
			url = url + urlPart1 + urlPart2_13 + year.toString().slice(-2) + urlPart3_13
			fileExtension = fileExtension13;
		} else {
			if (dataset16.some(ds => ds === dataset)) {
				url = url + urlPart1 + urlPart2_16 + year + urlPart3_16;
				fileExtension = fileExtension16;
			} else throw new Error("Incorrect dataset argument!");
		}
		/**
		 * make request:
		 */
		return new euriklis.promise((resolve, reject) => {
			let tmpFile = 'tmpGVC' + year + fileExtension
			if (fs.existsSync("WIOD/GVC" + year + ".json")) {
				console.log("The file already exists!!!");
				resolve(JSON.parse(fs.readFileSync("WIOD/GVC" + year + ".json")))
			}
			else request
				.get(url)
				.on("error", (err) => reject(err))
				.pipe(fs.createWriteStream(tmpFile))
				.on('finish', (err, data) => {
					if (err) reject(err)
					/**
					 * start reading of the file:
					 */
					let workbook = xlsx.readFile(tmpFile),
						sheets = workbook.Sheets,
						sheetNames = workbook.SheetNames,
						wsh = sheets[sheetNames[0]]; // the current worksheet
					const getCellValue = (cell) => {
						if (!(cell instanceof Object)) {
							const typeErr = "Internal Error : " +
								"the argument of subfunction getCellValue " +
								"have to be only of javascript object type!"
							euriklis.nrerror(typeErr)
						} else {
							if (cell["special"]) return wsh[cell.special].v;
							else {
								const syntaxError = "Syntax Error : " +
									"the argument object have to contain 'r' " +
									"and 'c' properties!", cellKeyes = Object.keys(cell)
								if (cellKeyes.indexOf('c') !== -1 && cellKeyes.indexOf('r') !== -1) return typeof wsh[
									xlsx
										.utils
										.encode_cell({
											r: cell.r,
											c: cell.c
										})
								] !== "undefined" ? wsh[
									xlsx
										.utils
										.encode_cell({
											r: cell.r,
											c: cell.c
										})
								].v : null
								else euriklis.nrerror(syntaxError);
							}
						}
					},
						maxCell = xlsx.utils.decode_cell(wsh['!ref'].split(':')[1]),
						maxRow = maxCell.r + 1, maxCol = maxCell.c + 1;
					let industries = [], countries = [],
						inter = [], output = [], final = [],
						total = [], VA = [], totalFinal = [],
						totalNames = [], finalNames = [], VAFinal = [];
					for (let i = 6; i < maxRow; i++) {
						let ip1 = i + 1
						countries.push(getCellValue({ special: ('C' + ip1) }));
						if (i < maxRow - 8) industries.push(getCellValue({ special: ("B" + ip1) }))
						else totalNames.push(getCellValue({ special: 'B' + ip1 }));
					}
					countries = countries.filter((v, i, a) => a.indexOf(v) === i)
					countries.pop();
					industries = industries.filter((v, i, a) => a.indexOf(v) === i);
					totalNames = totalNames.filter((v, i, a) => a.indexOf(v) === i)
					totalNames.pop();
					const G = countries.length, N = industries.length, tot_row_len = totalNames.length,
						GN = G * N, final_col_len = maxCol - GN - 5;
					for (let i = 6; i < GN + 6; i++) {
						inter.push([])
						final.push([]);
						output.push([getCellValue({ r: i, c: maxCol - 1 })]);
						let ii = i - 6;
						if (ii < tot_row_len) {
							total.push([]);
							totalFinal.push([]);
						}
						if (ii < final_col_len) {
							finalNames.push(getCellValue({ r: 3, c: ii + 4 + GN }))
						}
						for (let j = 4; j < GN + 4; j++) {
							let jj = j - 4;
							inter[ii][jj] = getCellValue({ r: i, c: j })
							if (jj < final_col_len) final[ii][jj] = getCellValue({ r: i, c: j + GN })
							if (ii < tot_row_len) {
								total[ii][jj] = getCellValue({ r: i + GN, c: j })
								if (jj < final_col_len) {
									totalFinal[ii][jj] = getCellValue({ r: i + GN, c: j + GN })
								}
							}
						}
					}
					let iot = {
						countries: countries,
						industries: industries,
						totalNames: totalNames,
						finalNames: finalNames,
						inter: inter,
						total: total,
						totalFinal: totalFinal,
						output: output
					}
					fs.writeFileSync("WIOD/GVC" + year + ".json", JSON.stringify(iot));
					fs.unlinkSync(tmpFile);
					resolve(iot);
				})
		})

	}
	function computeNTI(opt) {
		"use strict";
		let year = opt.year,
			countries = opt.countries,
			industries = opt.industries,
			data = opt.data;
		if (typeof countries === "undefined") throw new Error("Incorrect countries definition")
		if (!countries instanceof Array && countries.length !== 2) {
			throw new Error("The countries argument have to be a two dimensional array.")
		}
		let workIndustries;
		// set the industries:
		if (industries instanceof Array && industries.every(el => typeof el === "string")) {
			workIndustries = Array.from({ length: industries.length }).map((el, ind) => {
				return el = data.industries.indexOf(industries[ind])
			})
		} else {
			if (industries instanceof Array
				&& industries.every(el => typeof el === "number"
					&& el < data.industries.length)) {
				workIndustries = industries;
			} else {
				if (typeof industries === "string" && industries === "all") {
					workIndustries = Array.from({ length: data.industries.length })
						.map((el, ind) => {
							return el = ind;
						})
				} else throw new Error("Error:Incorrect industries declaration.");
			}
		}
		if (typeof data === "undefined") data = JSON.parse(fs.readFileSync("WIOD/GVC" + year + ".json"));
		let N = data.industries.length, G = data.countries.length, GN = G * N,
			Ns = workIndustries.length,
			ic = data.countries.indexOf(countries[0]),// index of countri i
			jc = data.countries.indexOf(countries[1]), // index of country j
			ip = (ic) * N,// position of country i
			jp = (jc) * N;//position of country j
		// start computing:
		// cj --> the imports of the country i of country j:
		let cj, sumci = 0, pi, NTI = 0,
			sumpi = Array.from({ length: N }).map((el, ind) => {
				return el = data.output[ip + ind][0]
			}).reduce((tot, num) => { return tot + num }, 0);
		for (let i = 0; i < Ns; i++) {
			sumci = Array.from({ length: GN }).map((el, ind) => {
				return el = data.inter[ind][(ip + i)]
			}).reduce((tot, num) => { return tot + num }, 0);
			if (sumci === 0) continue;
			cj = Array.from({ length: N })
				.map((el, ind) => {
					return el = data.inter[(jp + ind)][(ip + i)]
				}).reduce((tot, num) => { return tot + num }, 0);
			pi = data.output[ip + i][0]
			NTI += (cj / sumci) * (pi / sumpi)
		}
		return NTI;
	}
	function computeAdjNTI(options) {
		'use strict';
		const fs = require("fs");
		let year = (typeof options.year === "undefined") ? 2000 : options.year,
			dataset = typeof options.dataset === "undefined" ? 2016 : options.dataset,
			industries = typeof options.industries === "undefined" ? "all" : options.industries,
			symetric = typeof options.symetric !== "undefined" ? options.symetric : false,
			opt = {
				year: year,
				dataset: dataset,
				industries: industries
			};
		return GVC(opt).then(data => {
			let workIndustries;
			// set the industries:
			if (industries instanceof Array && industries.every(el => typeof el === "string")) {
				workIndustries = Array.from({ length: industries.length }).map((el, ind) => {
					return el = data.industries.indexOf(industries[ind])
				})
			} else {
				if (industries instanceof Array
					&& industries.every(el => typeof el === "number"
						&& el < data.industries.length)) {
					workIndustries = industries;
				} else {
					if (typeof industries === "string" && industries === "all") {
						workIndustries = Array.from({ length: data.industries.length })
							.map((el, ind) => {
								return el = ind;
							})
					} else throw new Error("Error:Incorrect industries declaration.");
				}
			}
			let G = data.countries.length, N = data.industries.length,
				// create the zeroed GVC adjacency matrix:
				AdjM = Array.from({ length: G }).map((el_i, ind) => {
					return el_i = Array.from({ length: G }).map(el_j => {
						return el_j = 0;
					})
				});
			for (let i = 0; i < G; i++) {
				for (let j = 0; j < G; j++) if (i !== j) {
					AdjM[i][j] = computeNTI({
						countries: [data.countries[i], data.countries[j]],
						industries: workIndustries,
						data: data
					})
				}
			}
			// now we'll scale the data
			// so AdjM(i,j) = (NTI(i,j) - NTImin)/(NTImax - NTImin)
			let NTImin = Math.min.apply(null, [].concat.apply([], AdjM)),
				NTImax = Math.max.apply(null, [].concat.apply([], AdjM)),
				scaledAdjM = Array.from({ length: G }).map((el_i, ind_i) => {
					return el_i = Array.from({ length: G }).map((el_j, ind_j) => {
						return el_j = (AdjM[ind_i][ind_j] !== 0) ?
							(AdjM[ind_i][ind_j] - NTImin) / (NTImax - NTImin) : 0;
					})
				});
			if (scaledAdjM.some(el => { el.length !== 44 && el.some(ell => ell === null) })) console.log("Error in the matrix")
			let scjsn = {};
			for (let i = 0; i < G; i++) {
				scjsn[data.countries[i]] = scaledAdjM[i];
			}
			fs.writeFileSync("WIOD/AdjNTI" + year + ".json", JSON.stringify(scjsn), "utf-8");
			if (symetric) {
				// weighted but not directed graph!
				for (let i = 0; i < G; i++) {
					for (let j = 0; j < G; j++) {
						scaledAdjM[i][j] += scaledAdjM[j][i];
						scaledAdjM[i][j] *= 0.5;
						scaledAdjM[j][i] = scaledAdjM[i][j];
					}
				}
				let symscjsn = {};
				for (let i = 0; i < G; i++) {
					symscjsn[data.countries[i]] = scaledAdjM[i];
				}
				fs.writeFileSync("WIOD/AdjSymetricM" + year + ".json", JSON.stringify(symscjsn), "utf-8");
			};
			return scaledAdjM;
		})
	}
	function getNiod(options) {
		"use strict";
		/**
		 * initializations:
		 */
		let country, year, countryAbbreviation,
			http = "http://www.wiod.org",
			url, httpReq1 = '', httpReq2 = '',
			fileExtension,
			request = require("request"),
			xlsx = require("xlsx"),
			fs = require("fs");
		/**
		 * the options have to be a
		 * javascript object with 
		 * properties "country" and "year":
		 */
		if (!(options instanceof Object)) euriklis.nrerror("The argument of the function getNIO have to be only object type");
		if (!(options["country"] && options["year"])) euriklis.nrerror("The argument of the getNIO function must have properties 'country' and 'year'")
		else { country = options.country; year = options.year; }
		/**
		 * Check if the country that you 
		 * search realy exists and set
		 * the variable 'countryAbbreviation'
		 * to be equals to the country:
		 */
		if (wiodCountries(country).Error) euriklis.nrerror(wiodCountries(country).Error)
		countryAbbreviation = wiodCountries(country).abbreviation;
		/**
		 * set the url of the http://www.wiod.org
		 */
		/**
		 * select the 2016 database if it is possible:
		 */
		if (options.setting === "select the best" || options.setting === "best") {
			if (year > 1994 && year < 2000) options.database = "2013"
			else options.database = "2016"
		}
		if ((year > 1994 && year < 2001) || (year > 1994 && year < 2012 && options.database === "2013")) {
			options.database = '2013';
			httpReq1 = "/protected3/data13/update_sep12/niot/";
			httpReq2 = "_NIOT_row_sep12";
			fileExtension = ".xlsx";
		} else {
			if ((year > 2011) || (year >= 2000 && year < new Date().getFullYear() - 1 && options.database !== "2013")) {
				options.database = '2016'
				httpReq1 = "/protected3/data16/niot/";
				httpReq2 = "_niot_nov16";
				fileExtension = ".xlsx";
			} else euriklis.nrerror("The data that you would like do not exsists");
		}
		url = http + httpReq1 + countryAbbreviation + httpReq2 + fileExtension;
		let temporaryNiodFileForYear = "temporaryNiodFileForYear" + year + fileExtension;
		/**
		 * get the data asynchronously:
		 */
		return new euriklis.promise((resolve, reject) => {
			request
				.get(url)
				.on("error", err => reject(err))
				.pipe(fs.createWriteStream(temporaryNiodFileForYear))
				.on("finish", function (err, data) {
					if (err) reject(err);
					const getCellValue = (cell) => {
						if (!(cell instanceof Object)) {
							const typeErr = "Internal Error : " +
								"the argument of subfunction getCellValue " +
								"have to be only of javascript object type!"
							euriklis.nrerror(typeErr)
						} else {
							if (cell["special"]) return worksheet2[cell.special].v;
							else {
								const syntaxError = "Syntax Error : " +
									"the argument object have to contain 'r' " +
									"and 'c' properties!", cellKeyes = Object.keys(cell)
								if (cellKeyes.indexOf('c') !== -1 && cellKeyes.indexOf('r') !== -1) return typeof worksheet2[
									xlsx
										.utils
										.encode_cell({
											r: cell.r,
											c: cell.c
										})
								] !== "undefined" ? worksheet2[
									xlsx
										.utils
										.encode_cell({
											r: cell.r,
											c: cell.c
										})
								].v : null
								else euriklis.nrerror(syntaxError);
							}
						}
					}
					let nio, workbook, worksheets,
						worksheet2, X = [], sectors = [], Im = [], F = [], Y = [],
						YI = [], FI = [], VX = [], VF = [], VY = [],
						demand = [], final = [], total = [];
					workbook = xlsx.readFile(temporaryNiodFileForYear),
						worksheets = workbook.Sheets;
					/**
					 * get the second sheet with name 
					 * "National IO tables"
					 */
					if (options.database === '2016' && (workbook.SheetNames[1] === "Input IO-tables" || workbook.SheetNames[1] === "National IO-tables")) {
						worksheet2 = worksheets[workbook.SheetNames[1]];
						/**
						 * In this case we need to 
						 * extract the data only for
						 * the year that we need.
						 * The schema of the document
						 * has the following form:
						 * ===================================================
						 * |     |             | sector i   | sector i + 1    |
						 * |year | sector i    | a(i,i)     | a(i, i + 1)     |
						 * |---- | sdctor i + 1| a(i + 1,i) | a(i + 1, i + 1) |
						 * |..................................................|
						 * |..................................................|
						 * |..................................................|
						 * |-----| import i    | a(i, i) ...                  |
						 * ===================================================
						 * |year1| sector i    | a(i, i)    | a(i, i + 1)     |
						 * |-----| sector i + 1| a(i + 1,i) | a(i + 1, i + 1) |
						 * |..................................................|
						 * |..................................................|
						 * |..................................................|
						 * |-----| import i    | a(i, i) ...                  |
						 * ===================================================
						 * ****************************************************
						 * We have to get only the 
						 * coefficients of matrix A for
						 * a concrette year 
						 */

						/**
						 * We must find the initial point that is needed
						 * for the searching. Usually this point is 'A3'
						 * with value 2000
						 */
						let initCell = "A3", initCellIsNotFound = true,
							initDim = new Object(),
							maxCell = xlsx.utils.decode_cell(worksheet2['!ref'].split(':')[1]),
							maxRow = maxCell.r + 1, maxCol = maxCell.c + 1
						initDim.r = 2, initDim.c = 0
						/**
						 * Check if this point is correct:
						 */
						let initCell1 = JSON.parse(JSON.stringify(initCell))
						while (initCellIsNotFound) {
							let checking = getCellValue({ special: initCell1 }) === 2000
							//&& getCellValue({ r: initDim.r, c: initDim.c + 1}) === "А01"
							if (checking) initCellIsNotFound = false;
							else {
								++initDim.r
								initCell1 = xlsx.utils.encode_cell(initDim)
							}
						}
						/**
						 * select the cell for the year:
						 */
						let operationalCell = initDim;
						while (maxRow - operationalCell.r) {
							let operationalCellIsFound = (+getCellValue(operationalCell)) === year
								&& (+getCellValue({ r: operationalCell.r - 1, c: operationalCell.c })) === (year - 1)
							if (operationalCellIsFound) break;
							else ++operationalCell.r
						}
						/**
						 * select the matrices: The protocol
						 * of this document (NIOD 2016) has 
						 * similar structure, but all years
						 * are included in the second sheet 
						 * and the abbreviation country name 
						 * is replaced with the 'Domestic' 
						 * while the 'Imports' is the same. 
						 */

						let i, j;
						for (i = operationalCell.r; i < maxRow; i++) {
							let isXi = getCellValue({ r: i, c: operationalCell.c + 3 }) === "Domestic",
								isImi = getCellValue({ r: i, c: operationalCell.c + 3 }) === "Imports",
								isVi = getCellValue({ r: i, c: operationalCell.c + 3 }) === "TOT"
							if (isXi) {
								X.push([])
								F.push([])
								Y.push([])
							} else {
								if (isImi) {
									Im.push([])
									FI.push([])
									YI.push([])
									sectors.push(getCellValue({ r: i, c: operationalCell.c + 2 }))
								} else {
									if (isVi) {
										VX.push([])
										VF.push([])
										VY.push([])
										total.push(getCellValue({ r: i, c: operationalCell.c + 2 }))
									}
								}
							}
							for (j = operationalCell.c; j < maxCol - 4; j++) {
								let isXj = getCellValue({
									r: j + operationalCell.r - operationalCell.c,
									c: operationalCell.c + 3
								}) === "Domestic"
								if (isXi) {
									if (isXj) X[X.length - 1].push(getCellValue({ r: i, c: j + 4 }))
									else {
										if (j < maxCol - 5) {
											F[F.length - 1].push(getCellValue({ r: i, c: j + 4 }))
											if (i === operationalCell.r) demand.push(getCellValue({ r: i - 1, c: j + 4 }))
										} else {
											Y[Y.length - 1].push(getCellValue({ r: i, c: j + 4 }))
										}
									}
								} else {
									if (isImi) {
										if (isXj) Im[Im.length - 1].push(getCellValue({ r: i, c: j + 4 }))
										else {
											if (j < maxCol - 5) FI[FI.length - 1].push(getCellValue({ r: i, c: j + 4 }))
											else YI[YI.length - 1].push(getCellValue({ r: i, c: j + 4 }))
										}
									} else {
										if (isXj) VX[VX.length - 1].push(getCellValue({ r: i, c: j + 4 }))
										else {
											if (j < maxCol - 5) VF[VF.length - 1].push(getCellValue({ r: i, c: j + 4 }))
											else {
												VY[VY.length - 1].push(getCellValue({ r: i, c: j + 4 }))
												if (i === maxRow - 1) final.push(getCellValue({ r: initCell.r - 1, c: j + 4 }))
											}
										}
									}
								}
							}
						}
					}
					/**
					 * find the year. The year is
					 * inserted in cell A3. If the
					 * year is not at this cell 
					 * search in a region of 10 cells.
					 * If the year is from database
					 * of 2013, the protocol is 
					 * different from the database 
					 * of 2016. In this case the
					 * years are defined as sheetnames
					 * so the program will search for 
					 * sheetname with similar name 
					 * to the year.
					 */
					if (options.database === '2013') {
						for (let i = 0; i < workbook.SheetNames.length; i++) {
							/**
							 * get the year --> 
							 * in the workbook.SheetNames array include
							 * the string values of the years that
							 * are available in the wiod database.
							 * With putting the '+' sign inrfont of
							 * the element of the array we transform it
							 * to javascript number type, so we can 
							 * compare the year that we want and the values
							 * that are available in wiod database...
							 */
							if (+workbook.SheetNames[i] === year) {
								worksheet2 = worksheets[workbook.SheetNames[i]]
								/**
								 * stop to search for year ...
								 */
								break;
							}
						}
						//worksheet2
						/**
						 * get the max row and the max column 
						 * of the document:
						 */
						let maxCell = xlsx.utils.decode_cell(worksheet2['!ref'].split(":")[1]),
							maxRow = maxCell.r + 1, maxCol = maxCell.c + 1;
						/**
						 * We must divide the document and to
						 * get four partions. In the first  
						 * part we have to inside the IO 
						 * matrix of the countryor X matrix. In the 
						 * second we have to get the imported
						 * IO matrix or Import X matrix. In third we put the 
						 * the added value or V, in the 
						 * fourth we put the demandmatrix or
						 * Y matrix and finaly we create the
						 * finaly output ot F matrix. Usually 
						 * the sectors are 35 but we will not
						 * assume this to be sure. 
						 */
						//get the initial cell for searching:
						let initialCellIsNotFinded = true, initCell;
						while (initialCellIsNotFinded) {
							/**
							 * We assume that the D7 is
							 * the initial cell, because
							 * of the observations that we
							 * have done (10.04.2018). The 
							 * test if the cell is the correct
							 * is to check if the previous
							 * cell is the name of the country 
							 */
							initCell = "D7";
							let wc = 3, wr = 6, isCorrect = () => {
								return getCellValue({ special: initCell }) === "c1"
									&& getCellValue({ r: wr, c: (wc - 1) }) === countryAbbreviation;
							}
							if (isCorrect()) {
								initCell = xlsx.utils.encode_cell({ r: wr, c: wc });
								initialCellIsNotFinded = false;
							}
							else {
								if (wr > maxRow) {
									initialCellIsNotFinded = false;
									throw new Error("The data is not available!")
								}
								++wr;
							}
						}

						/**
						 * start to construct the matrices:
						 */

						let i, j,
							initDimension = xlsx.utils.decode_cell(initCell);
						for (i = xlsx.utils.decode_cell(initCell).r; i < maxRow; i++) {
							let isXi = getCellValue({
								r: i,
								c: initDimension.c - 1
							}) === countryAbbreviation
								&& getCellValue({
									r: i,
									c: initDimension.c
								})[0] === 'c',
								isImi = getCellValue({
									r: i,
									c: initDimension.c - 1
								}) === 'Imports'
							if (isXi) {
								X.push([])
								F.push([])
								Y.push([])
								sectors.push(getCellValue({ r: i, c: initDimension.c - 2 }))
							} else {
								if (isImi) {
									Im.push([])
									FI.push([])
									YI.push([])
								} else {
									VX.push([])
									VF.push([])
									VY.push([])
									total.push(getCellValue({ r: i, c: initDimension.c - 2 }))
								}
							}
							for (j = xlsx.utils.decode_cell(initCell).c; j < maxCol - 1; j++) {
								let isXj = getCellValue({
									r: j - initDimension.c + initDimension.r,
									c: initDimension.c - 1
								}) === countryAbbreviation;
								if (isXi) {
									if (isXj) X[X.length - 1].push(getCellValue({ r: i, c: j + 1 }))
									else {
										if (j < maxCol - 2) {
											F[F.length - 1].push(getCellValue({ r: i, c: j + 1 }))
											if (i === initDimension.r) demand.push(getCellValue({ r: i - 3, c: j + 1 }))
										} else {
											Y[Y.length - 1].push(getCellValue({ r: i, c: j + 1 }))
											if (i === initDimension.r) final.push(getCellValue({ r: i - 3, c: j + 1 }))
										}
									}
								} else {
									if (isImi) {
										if (isXj) Im[Im.length - 1].push(getCellValue({ r: i, c: j + 1 }))
										else {
											if (j < maxCol - 2) FI[FI.length - 1].push(getCellValue({ r: i, c: j + 1 }))
											else YI[YI.length - 1].push(getCellValue({ r: i, c: j + 1 }))
										}
									} else {
										if (isXj) VX[VX.length - 1].push(getCellValue({ r: i, c: j + 1 }))
										else {
											if (j < initDimension.c - 2) VF[VF.length - 1].push(getCellValue({ r: i, c: j + 1 }))
											else VY[VY.length - 1].push(getCellValue({ r: i, c: j + 1 }))
										}
									}
								}
							}
						}
					}
					nio = {}
					nio.X = {
						matrix: X.toMatrix(),
						columns: sectors,
						rows: sectors
					};
					nio.Imports = {
						X: {
							matrix: Im.toMatrix(),
							columns: sectors,
							rows: sectors
						},
						F: {
							matrix: FI.toMatrix(),
							rows: demand,
							columns: sectors
						},
						Y: {
							matrix: YI.toMatrix(),
							rows: final,
							columns: sectors
						}
					};
					nio.V = {
						sectors: {
							matrix: VX.toMatrix(),
							rows: total,
							columns: sectors
						},
						consumption: {
							matrix: VF.toMatrix(),
							rows: total,
							columns: demand
						},
						Y: {
							matrix: VY.toMatrix(),
							rows: final,
							columns: total
						}
					}
					nio.F = { matrix: F.toMatrix(), rows: sectors, columns: demand };
					nio.Y = { matrix: Y.toMatrix(), rows: sectors, columns: final };
					fs.unlinkSync(temporaryNiodFileForYear)
					resolve(nio);
				})
		})
	}
	exports.getDat = datToJSON;
	exports.setDat = setDat;
	exports.getJSON = getJSON;
	exports.getDatasetsFromDatabases = getDatasetsFromDatabases;
	exports._getDatasetAndDatabaseCode_ = _getDatasetAndDatabaseCode_;
	exports.getDatasetAndDatabaseCode = getDatasetAndDatabaseCode;
	exports.allCompaniesOfSP500 = allCompaniesOfSP500;
	exports.getInformationForConcreteStock = Get_information__for_concrete_stock;
	exports.getInformationForFewStocks = Get_information_for_few_stocks;
	exports.getAllSP500StocksForAPeriod = Get_all_sp500_stocks_for_a_period;
	exports.search = quandlSearch;
	exports.sortedSearch = getPage;
	exports.quick_search = quick_search;
	exports.getDataFromDatabase = getDataFromDatabase;
	exports.getMultipleDataFromDatabase = getMultipleDataFromDatabase;
	exports.tabulate = tabulate;
	exports.plotLinechart = plotLinechart;
	exports.plotPiechart = plotPiechart;
	exports.getIO = createInputOutputMatrix;
	exports.getNIO = getNiod;
	exports.GVC = GVC;
	exports.computeAdjNTI = computeAdjNTI;
	exports.computeNTI = computeNTI;
	exports.openModalWindow = openModalWindow1;
})(euriklis.data);
/*Symbol utility functions*/
euriklis.charUtility = new Object();
euriklis.charUtility.allCombinationsPerCouples = function allCombinationsPerCouples(symbolsArr) {
	var combinations = new Array(), combination;
	symbolsArr = euriklis.deepCopy(symbolsArr);
	symbolsArr = symbolsArr.filter(function (item, pos, self) { return self.indexOf(item) == pos; });
	for (var el = 0; el < symbolsArr.length; el++) {
		for (var everyel = 0; everyel < symbolsArr.length; everyel++) {
			elem1 = symbolsArr[el].toString();
			elem2 = symbolsArr[everyel].toString();
			combination = elem1.concat(elem2);
			combinations.push(combination);
		}
	}
	return combinations;
};
euriklis.charUtility.termIndexes = euriklis.charUtility.termIndices = function termIndexes(term, eq) {
	var indexPoint = 0, searchTermLen = term.length, index, indexes = [];
	while ((index = eq.indexOf(term, indexPoint)) > -1) {
		indexes.push(index);
		indexPoint = index + searchTermLen;
	}/*return the indexes or indices of starting of the search string*/
	return indexes;
}

/*Comparison of two numbers*/
euriklis.charUtility.comparison = function comparison(a, b) {
	var comparison;
	(a > b) ? comparison = '>' : (a < b) ? comparison = '<' : comparison = '=';
	return comparison;
}
euriklis.charUtility.isE = function (ch) { return ch === 'e' }
euriklis.charUtility.isPlus = function (ch) { return ch === '+'; }
euriklis.charUtility.isDev = function (ch) { return ch === '\/'; }
euriklis.charUtility.isMinus = function (ch) { return ch === '-'; }
euriklis.charUtility.isStar = function (ch) { return ch === '*'; }
euriklis.charUtility.isPower = function (ch) { return ch === '^'; }
euriklis.charUtility.isDot = function (ch) { return ch === '.' }
euriklis.charUtility.illegalE = function (expression, pos) {
	var chut = euriklis.charUtility;
	return chut.isE(expression.charAt(pos)) && chut.isPlus(expression.charAt(pos + 1)) ? true :
		chut.isE(expression.charAt(pos)) && chut.isMinus(expression.charAt(pos + 1)) ? true : false;
}
euriklis.charUtility.isOtherChar = function (ch) { return /^[a-df-zA-Z&|%#@\\\"\'\;\?\>\<\€\$\=\№\!\s''\|\[\]\{\}\,]+$/g.test(ch); }
euriklis.charUtility.isFstParenthesis = function (ch) { return ch === '('; }
euriklis.charUtility.isSndParenthesis = function (ch) { return ch === ')'; }
euriklis.charUtility.hasTwoParenthesis = function (string) {
	return (string.indexOf('(') !== -1 || string.indexOf(')') !== -1) ?
		((string.indexOf('(') !== -1 && string.indexOf(')') !== -1) ? true : false) :
		'non parenthesis';
};
String.prototype.insert = function (index, string) {
	if (index > 0)
		return this.substring(0, index) + string + this.substring(index, this.length);
	else
		return string + this;
};
Array.prototype.toMatrix = function () {
	return euriklis.Mathematics.cloning(this);
}
euriklis.charUtility.hasPow = function (str) { return /\^/.test(str); }
euriklis.charUtility.isChi = function (ch) { return (!/[\^]/.test(ch) && /[x]/.test(ch)) && isNaN(parseFloat(ch)); }
euriklis.charUtility.isPow = function (ch) { return /[^]/.test(ch) && ch.split('\^') !== ch; }
euriklis.charUtility.powParam = function (ch) {
	var powArr = ch.split('\^');
	return powArr.length === 2 && euriklis.charUtility.isChi(powArr[0]) ? powArr : false;
}
/*
Dimension of an array:
*/
euriklis.dimension = function dim(x) {
	function _dim(x) {
		var ret = [];
		while (typeof x === "object") { ret.push(x.length); x = x[0]; }
		return ret;
	}
	var y, z;
	if (typeof x === "object") {
		y = x[0];
		if (typeof y === "object") {
			z = y[0];
			if (typeof z === "object") {
				return _dim(x);
			}
			return [x.length, y.length];
		}
		return [x.length];
	}
	return [];
}
euriklis.deepCopy = function deepCopy(o) {
	var copy = o, k;

	if (o && typeof o === 'object') {
		copy = Object.prototype.toString.call(o) === '[object Array]' ? [] : {};
		for (k in o) {
			copy[k] = euriklis.deepCopy(o[k]);
		}
	}

	return copy;
}
/*testing i an element is number*/
euriklis.isNumber = function isNumber(o) {
	return !isNaN(o - 0) && o !== null && o !== "" && o !== false;
}
/*
3.The Mathematics type:
*/
euriklis.Mathematics = new Object();
euriklis.Mathematics.filters = {};
(function (exports) {
	'use strict';
	function fft(data, opt) {
		/**
		 * The data can be an array with 2^k
		 * length and every element have to be
		 * "euriklis.Mathematics.complex" type.
		 * This is no checked from this function
		 * by default. If you want to check
		 * if the input data satisfy this conditions
		 * set the options (opt) property "check"
		 * to be equals to true or 1.
		 * If you want to round up the imaginere
		 * part for every element set the property
		 * roundIm to be equals to true or 1 
		 */
		opt = opt || {};
		opt.check = opt.check ? opt.check : false;
		opt.roundIm = opt.roundIm ? opt.roundIm : false;
		const n = data.length, complex = euriklis.Mathematics.complex;
		let checked = true, roundIm = opt.roundIm || false, i;
		/**
		 * copy the initial array:
		 */
		let d = Array.from({ length: data.length })
			.map((e, i) => { return e = data[i] });
		if (opt.check) {
			if (!(n & !(n & (n - 1)))) euriklis
				.nrerror("The length of the data have to be power of two!!!");
		}
		/**
		 * define stop criteria for the recursion:
		 */
		if (n <= 1) return d;
		let middle_n = n / 2;
		/**
		 * create two fft's (divide and conquer strategy)
		 */
		let even = [], odd = [];
		even.length = middle_n, odd.length = middle_n;
		for (i = 0; i < middle_n; ++i) {
			even[i] = d[2 * i];
			odd[i] = d[2 * i + 1];
		}
		/**
		 * run the recursion:
		 */

		even = fft(even);
		odd = fft(odd);
		let PIx2 = -6.283185307179586476925286766559005768394338798750211641949;
		for (let k = 0; k < middle_n; ++k) {
			/**
			 * ensure that every element 
			 * of d is complex number:
			 */
			if (!(even[k].constructor === complex)) even[k] = new complex(even[k]);
			if (!(odd[k].constructor === complex)) odd[k] = new complex(odd[k]);
			/**
			 * declare the period:
			 */
			let p = k / n;
			/**
			 * initialize the exponent parameter:
			 * ω = 2pπι
			 */
			let omega = new euriklis.Mathematics.complex(0, PIx2 * p);
			/**
			 * create the multipliers:
			 *  odd(k)*e^2pπ
			 */
			omega = omega.exp().times(odd[k]);
			odd[k] = even[k].plus(omega);
			d[k] = odd[k];
			//odd[k] = d[k];
			even[k] = even[k].minus(omega);
			d[k + middle_n] = even[k];
			//even[k] = d[k + middle_n];
		}
		if (roundIm) {
			for (i = 0; i < d.length; i++) {
				d[i].Im = d[i].Im < Math.pow(2, -16) ? 0 : d[i].Im;
			}
		}
		return d;
	}
	function ifft(data, opt) {
		/**
		 * This function computes the inverse
		 * fft. The lenght of the data array 
		 * have to be power of two. This is not
		 * checked from the function by default
		 * and if the user wants to check for
		 * error data have to set the parameter 
		 * opt.check to be equals to "true" or
		 * 1 alternatively. If you want to round
		 * up the imaginare part of the data
		 * element you have to set the opt.roundIm
		 * to be equals to "true" or 1.  
		 */
		const n = data.length, n1 = 1 / n;
		/**
		 * copy the data:
		 */
		let d = Array.from({ length: n })
			.map((e, i) => { return e = data[i] }), i;
		/**
		 * set
		 * the options of the function: 
		 */
		opt = opt || {};
		opt.check = opt.check ? opt.check : false;
		opt.roundIm = opt.roundIm ? opt.roundIm : false;
		if (opt.check) {
			if (!(n & !(n & (n - 1)))) euriklis
				.nrerror("The length of the data have to be power of two!!!");
		}
		/**
		 * set condjugate
		 */
		for (i = 0; i < n; i++) {
			if (d[i].constructor === euriklis.Mathematics.complex) {
				d[i].Im = -d[i].Im;
			}
		}
		d = fft(d, opt.roundIm);
		/**
		 * condjugate :
		 */
		for (i = 0; i < n; i++) {
			if (d[i].Im !== 0) d[i].Im = -d[i].Im;
			//d[i] = d[i].times(n1);
			d[i].Re *= n1;
			d[i].Im *= n1;
		}
		return d;
	}
	exports.fft = fft;
	exports.inverseFft = exports.ifft = ifft;
})(euriklis.Mathematics.filters)
euriklis.Mathematics.Graph = function (graph, width, height) {
	"use strict";
	let nodeCoordinates = [],
		linksCoordinates = [], linkWeights;
	function createCircleForNode(node) {
		//get the group or something other prop 
		//of the graph:
		const name = node.id;
		let createRandomCoordinates = (node) => {
			let rnd = Math.random, rx = 0.5 * width * rnd() + 0.5 * height * rnd(),
				ry = 0.5 * width * rnd() + 0.5 * height * rnd(), drx, dry;
			if (!nodeCoordinates[0]) {
				let cx = width / 2, cy = height / 2;
				return { node: node, x: cx, y: cy }
			}
			while (isNearToOtherNode(rx, ry).bool) {
				drx = isNearToOtherNode(rx, ry).dxy[0];
				dry = isNearToOtherNode(rx, ry).dxy[1];
				rx = 1.2 * (rx + drx);
				ry = 1.2 * (ry + dry);
			}
			return { node: node, x: rx, y: ry };
		};
		let isNearToOtherNode = (x, y) => {
			let nk = nodeCoordinates.length, ans = { bool: false, coordinates: [] }, abs = Math.abs;
			for (let i = 0; i < nk; i++) {
				if (abs(x - nodeCoordinates[i].x) < 15 && abs(y - nodeCoordinates[i].y) < 15) {
					ans.bool = true;
					ans.dxy = [nodeCoordinates[i].x - x, nodeCoordinates[i].y - y];
					break;
				}
			}
			return ans;
		};
		//let createNodeWithCoordinates (_node, )
		let node_coordinates = node.x && node.y ? { node: node.id, x: node.x, y: node.y } :
			createRandomCoordinates(name);
		nodeCoordinates.push(node_coordinates);
	};
	let createNodeRadius = () => {
		let i = 0, normalize = 5,
			goto = "check if exists radius";
		while (goto) {
			switch (goto) {
				case "check if exists radius":
					if (graph.nodes[i].r) {
						if (!isNaN(graph.nodes[i].r)) {
							if (graph.nodes[i].r > 5) {
								if (normalize > 5 / graph.nodes[i].r) {
									normalize = 5 / graph.nodes[i].r;
								}
								goto = "check for end"
							}
						} else {
							graph.nodes[i].r = 5;
						}
						goto = "check for end"
					} else {
						goto = "create radius"
					}
					break;
				case "create radius":
					graph.nodes[i].r = 5;
					goto = "check for end"
					break;
				case "check for end":
					if (i < graph.nodes.length - 1) {
						i += 1;
						goto = "check if exists radius"
					} else goto = "normalize radius"
					break;
				case "normalize radius":
					if (normalize !== 5) {
						for (i = 0; i < graph.nodes.length; i++) {
							graph.nodes[i].r *= normalize;
						}
						goto = 0;
					} else goto = 0;
			}
		}
	}
	//if do not exist coordinates x and y
	//create them for every node else 
	//copy them. Put the coordinates into the
	//node_coordinates array.
	for (let i = 0; i < graph.nodes.length; i++) {
		createCircleForNode(graph.nodes[i]);
		graph.nodes[i].x = nodeCoordinates[i].x;
		graph.nodes[i].y = nodeCoordinates[i].y;
	}
	//create the links
	let createLinkCoordinates = (link) => {
		let i, x1, x2, y1, y2, r1, r2, a, b, c;
		for (i = 0; i < graph.nodes.length; i++) {
			if (graph.nodes[i].id === link.source) {
				x1 = graph.nodes[i].x;
				y1 = graph.nodes[i].y;
				r1 = graph.nodes[i].r;
			}
			if (graph.nodes[i].id === link.target) {
				x2 = graph.nodes[i].x;
				y2 = graph.nodes[i].y;
				r2 = graph.nodes[i].r
			}
		}
		a = x2 - x1, b = y1 - y2, c = Math.sqrt(a * a + b * b);
		x1 += r1 * a / c;
		x2 -= r2 * a / c;
		y1 -= r1 * b / c;
		y2 += r2 * b / c;
		linksCoordinates.push({ source: link.source, target: link.target, x1: x1, y1: y1, x2: x2, y2: y2 });
	}
	//create or sort the link weights:
	let createLinkWeights = () => {
		let i, maxweight = 1, goto = "check for weights existing";
		while (goto) {
			switch (goto) {
				case "check for weights existing":
					goto = "weights do not exist"
					for (i = 0; i < graph.links.length; i++) {
						if (graph.links[i].weight) {
							if (goto !== "normalize weights") goto = "weights exist"
							if (graph.links[i].weight > 1) {
								goto = "normalize weights";
								if (graph.links[i].weight > maxweight) maxweight = graph.links[i].weight;
							}
						}
					}
					break;
				case "weights exist":
					for (i = 0; i < graph.links.length; i++) {
						if (!graph.links[i].weight) graph.links[i].weight = 1;
					}
					goto = 0;
					break;
				case "weights do not exist":
					for (i = 0; i < graph.links.length; i++) {
						graph.links[i].weight = 1;
					}
					goto = 0;
					break;
				case "normalize weights":
					for (i = 0; i < graph.links.length; i++) {
						if (!graph.links[i].weight) graph.links[i].weight = 1;
						else graph.links[i].weight /= maxweight;
					}
					goto = 0;
					break;
			}
		}
	}
	createNodeRadius();
	createLinkWeights();
	for (let i = 0; i < graph.links.length; i++) {
		createLinkCoordinates(graph.links[i]);
		graph.links[i].coordinates = {
			x1: linksCoordinates[i].x1,
			x2: linksCoordinates[i].x2,
			y1: linksCoordinates[i].y1,
			y2: linksCoordinates[i].y2
		}
	}
	return graph;
}
euriklis.Mathematics.Matrix = function Matrix(arr) {
	this.M = arr;
	this.rows = euriklis.dimension(arr).length === 1 ? 1 :
		euriklis.dimension(arr).length === 2 ? arr.length :
			euriklis.nrerror('Incorrect mathematical array!!!');
	this.columns = euriklis.dimension(arr).length === 1 ? arr.length :
		euriklis.dimension(arr).length === 2 ? arr[0].length :
			euriklis.nrerror('Incorrect mathematical array!!!');
}

euriklis.Mathematics.Matrix.prototype.rows = function () { return this.rows; }
euriklis.Mathematics.Matrix.prototype.columns = function () { return this.columns; }
/*euriklis.Mathematics.Matrix.prototype.toString = function() {
    var s = []
    for (var i = 0; i < this.M.length; i++) 
        s.push( this.M[i].join(",") );
    return s.join("\n");
}*/

// returns a new matrix
euriklis.Mathematics.Matrix.prototype.transpose = function TransMatrix() {
	A = this.M;
	var m = A.length, n = A[0].length, AT = [];
	for (var i = 0; i < n; i++) {
		AT[i] = [];
		for (var j = 0; j < m; j++) AT[i][j] = A[j][i];
	}
	return new euriklis.Mathematics.Matrix(AT);
}
euriklis.Mathematics.Matrix.prototype.unique = function () {
	return this.rows === 1 ? this.M.filter(function (item, possition, self) {
		return self.indexOf(item) == possition;
	}) :
		euriklis.nrerror('incorrect use of the unique property!!!');
}
//Sorting of an array with merge-sort algorithm:
euriklis.Mathematics.Matrix.prototype.mergeSort = function () {
	var This = this.M;
	if (this.rows !== 1) euriklis.nrerror('Incorrect use of the mergesort property!!!');
	//copy of the array:
	var cpArr = new Array();
	for (i = 0; i < This.length; i++) { cpArr[i] = This[i]; }
	//merge-sort algorithm:
	function mergeSort(arr) {
		if (arr.length < 2) return arr;
		var middle = parseInt(arr.length / 2);
		var left = arr.slice(0, middle);
		var right = arr.slice(middle, arr.length);
		return merge(mergeSort(left), mergeSort(right));
	}
	function merge(left, right) {
		var result = [];
		while (left.length && right.length) {
			if (left[0] <= right[0]) {
				result.push(left.shift());
			}
			else {
				result.push(right.shift());
			}
		}
		while (left.length) result.push(left.shift());
		while (right.length) result.push(right.shift());
		return result;
	}
	//checking if an array contains an element:
	Array.prototype.contains = function (obj) {
		var i = this.length;
		while (i--) {
			if (this[i].toString() === obj.toString()) {
				return true;
			}
		}
		return false;
	}
	//assigment of the array coefficients to the sorted array coefficients:
	var ms = mergeSort(cpArr);
	function assigment(ms) {
		var assigment = new Array();
		for (i = 0; i < cpArr.length; i++) {
			var k = [];
			for (j = 0; j < cpArr.length; j++) {
				if (ms[i] == cpArr[j]) {
					if (!k.contains(j)) k.push(j);
				}
			}
			if (!assigment.contains(k)) { assigment.push(k); }
		}
		return assigment;
	}
	function sc(ms) {
		Array.prototype.getAllIndexes = function getAllIndexes(val) {
			var indexes = [], i = -1;
			while ((i = this.indexOf(val, i + 1)) != -1) {
				indexes.push(i);
			}
			return indexes;
		}
		var result = new Array();
		var sum = 0, wa = new Array();
		for (i = 0; i < cpArr.length; i++) {
			sum = 0;
			wa = ms.getAllIndexes(cpArr[i]);
			sum = wa[0] + (wa.length - 1) / 2 + 1;
			result.push(sum);
		}
		return result;
	}
	//result:
	return { sort: new euriklis.Mathematics.Matrix(mergeSort(cpArr)), coefficientsAssigment: assigment(ms), spearmanRank: sc(ms) };
}
euriklis.Mathematics.createMatrix = function (rows, cols) {
	var i, arr = new Array();
	for (i = 0; i < rows; i++) {
		arr[i] = new Array(cols);
	}
	return new euriklis.Mathematics.Matrix(arr);
}
//Cloning of matrix.
euriklis.Mathematics.cloning = function (A) {
	var rows, cols;
	if (A.constructor === Array) {
		rows = euriklis.dimension(A).length === 1 ? 1 :
			euriklis.dimension(A).length === 2 ? A.length :
				euriklis.nrerror('Incorrect mathematical array!!!');
		cols = euriklis.dimension(A).length === 1 ? A.length :
			euriklis.dimension(A).length === 2 ? A[0].length :
				euriklis.nrerror('Incorrect mathematical array!!!');
		This = euriklis.Mathematics.createMatrix(rows, cols);
		for (i = 0; i < A.length; i++) {
			if (A[i].constructor != Array) {
				This.M[i] = A[i];
			}
			if (A[i].constructor === Array) {
				for (j = 0; j < A[i].length; j++) {
					This.M[i][j] = A[i][j];

				}
			}
		}
	}
	else {
		if (A.constructor === euriklis.Mathematics.Matrix) {
			This = euriklis.Mathematics.cloning(A.M);
		}
	}
	return This;
}
/*test if all elements of a vector are numbers*/
euriklis.Mathematics.Matrix.prototype.isEveryElementNumber = function TestingIfEveryElementOfTheVectorIsNumber() {
	var result;
	Vector = this.rows === 1 ? this.M : false;
	if (Array.isArray(Vector)) result = Vector.every(euriklis.isNumber);
	else result = false
	return result;
}

//Άθροισμα  όλων των στοιχείων ενός διανοίσματος.
function SumOfTheEllementsOfVector(Vector) {
	var sum = 0;
	for (i = 0; i < Vector.length; i++) { sum += parseFloat(Vector[i]); }
	return sum;
}//Άθροισμα  όλων των στοιχείων ενός διανοίσματος.
euriklis.Mathematics.Matrix.prototype.SumOfElements = function SumOfTheEllementsOfVector() {
	var sum = 0;
	var Vector = this.rows === 1 ? this.M : false;
	for (i = 0; i < Vector.length; i++) { sum += parseFloat(Vector[i]); }
	return sum;
}

/**
 * Frobenius norm of an matrix: 
 */
euriklis.Mathematics.Matrix.prototype.FrobeniusNorm = function FrobeniusNorm() {
	var i, j, norm = 0, a = this.M, rows = this.rows, cols = this.columns;
	for (i = 0; i < rows; i++)
		for (j = 0; j < cols; j++) norm += a[i][j] * a[i][j];
	norm = Math.sqrt(norm);
	return norm;
}
/*Determinant of a Matrix --> O(n^3):*/
euriklis.Mathematics.Matrix.prototype.Determinant = function Determinant() {
	var A = this.M;
	var N = A.length, B = [], denom = 1, exchanges = 0;
	for (var i = 0; i < N; ++i) {
		B[i] = [];
		for (var j = 0; j < N; ++j) B[i][j] = A[i][j];
	}
	for (var i = 0; i < N - 1; ++i) {
		var maxN = i, maxValue = Math.abs(B[i][i]);
		for (var j = i + 1; j < N; ++j) {
			var value = Math.abs(B[j][i]);
			if (value > maxValue) { maxN = j; maxValue = value; }
		}
		if (maxN > i) {
			var temp = B[i]; B[i] = B[maxN]; B[maxN] = temp;
			++exchanges;
		}
		else { if (maxValue == 0) return maxValue; }
		var value1 = B[i][i];
		for (var j = i + 1; j < N; ++j) {
			var value2 = B[j][i];
			B[j][i] = 0;
			for (var k = i + 1; k < N; ++k) B[j][k] = (B[j][k] * value1 - B[i][k] * value2) / denom;
		}
		denom = value1;
	}
	if (exchanges % 2) return -B[N - 1][N - 1];
	else return B[N - 1][N - 1];
}
euriklis.Mathematics.Matrix.prototype.toReducedRowEchelonForm = function () {
	var matrix = this.M, a = euriklis.Mathematics.cloning(matrix).M;
	var lead = 0, rowCount = this.rows, columnCount = this.columns;
	for (var r = 0; r < rowCount; r++) {
		if (columnCount <= lead) break;
		var i = r;
		while (a[i][lead] === 0) {
			i++;
			if (i == rowCount) {
				i = r;
				lead++;
				if (columnCount == lead) {
					lead--;
					break;
				}
			}
		}
		for (var j = 0; j < columnCount; j++) {
			var temp = a[r][j];
			a[r][j] = a[i][j];
			a[i][j] = temp;
		}
		var div = a[r][lead];
		if (div !== 0)
			for (j = 0; j < columnCount; j++) a[r][j] /= div;
		for (j = 0; j < rowCount; j++) {
			if (j != r) {
				var sub = a[j][lead];
				for (var k = 0; k < columnCount; k++) a[j][k] -= (sub * a[r][k]);
			}
		}
		lead++;
	}
	return new euriklis.Mathematics.Matrix(a);
}
/*Sum of Matrix*/
euriklis.Mathematics.Matrix.prototype.plus = function SumMatrix(B) {
	var A = this.M, B = euriklis.Mathematics.cloning(B).M, m = A.length, n = A[0].length, C = [];
	for (var i = 0; i < m; i++) {
		C[i] = [];
		for (var j = 0; j < n; j++) C[i][j] = A[i][j] + B[i][j];
	}
	return new euriklis.Mathematics.Matrix(C);
}
euriklis.Mathematics.Matrix.prototype.minus = function minus(B) {
	B = euriklis.Mathematics.cloning(B);
	return this.plus(B.times(-1));
}
euriklis.Mathematics.Matrix.prototype.times = function (B) {
	var A = this.M;
	/*Multiply matrix with constant*/
	function __multMatrixNumber__(a, A) {
		var m = A.length, n = A[0].length, B = [];
		for (var i = 0; i < m; i++) {
			B[i] = [];
			for (var j = 0; j < n; j++) B[i][j] = a * A[i][j];
		}
		return B;
	}
	/*Multiplying of matrices*/
	function __MultiplyMatrix__(A, B) {
		var rowsA = A.length, colsA = A[0].length,
			rowsB = B.length, colsB = B[0].length,
			C = [];
		if (colsA != rowsB) return false;
		for (var i = 0; i < rowsA; i++) C[i] = [];
		for (var k = 0; k < colsB; k++) {
			for (var i = 0; i < rowsA; i++) {
				var t = 0;
				for (var j = 0; j < rowsB; j++) t += A[i][j] * B[j][k];
				C[i][k] = t;
			}
		}
		return C;
	}
	var result = euriklis.isNumber(B) ? __multMatrixNumber__(B, A) :
		B.constructor === Array ? __MultiplyMatrix__(A, B) :
			B.constructor === euriklis.Mathematics.Matrix ? __MultiplyMatrix__(A, B.M) :
				false;
	return new euriklis.Mathematics.Matrix(result);
}
euriklis.Mathematics.Matrix.prototype.Kronecker = function (b) {
	'use strict';
	let a = this, ar = a.rows, ac = a.columns, i, j;
	b = euriklis.Mathematics.cloning(b);
	let br = b.rows, bc = b.columns,
		c = euriklis.Mathematics.createMatrix(ar * br, ac * bc);
	for (i = 0; i < ar; i++) {
		for (j = 0; j < ac; j++) c
			.setBlock([i * br, j * bc],
				[(i + 1) * (br - 1), (j + 1) * (bc - 1)],
				b.times(a.M[i][j]));
	}
	return c;
}
euriklis.Mathematics.Matrix.prototype.pow = function MatrixPow(n) {
	if (n == 1) return this;
	else return this.times(this.pow(n - 1));
}
euriklis.Mathematics.Matrix.prototype.rank = function MatrixRank() {
	var A = this.M, m = A.length, n = A[0].length, k = (m < n ? m : n), r = 1, rank = 0;
	while (r <= k) {
		var B = [];
		for (var i = 0; i < r; i++) B[i] = [];
		for (var a = 0; a < m - r + 1; a++) {
			for (var b = 0; b < n - r + 1; b++) {
				for (var c = 0; c < r; c++) {
					for (var d = 0; d < r; d++) B[c][d] = A[a + c][b + d];
				}
				if (new euriklis.Mathematics.Matrix(B).Determinant() != 0) rank = r;
			}
		}
		r++;
	}
	return rank;
}
// Adj Matrix.
euriklis.Mathematics.Matrix.prototype.Adjugate = function AdjugateMatrix(A) {
	A = this.M;
	var N = A.length, adjA = [];
	for (var i = 0; i < N; i++) {
		adjA[i] = [];
		for (var j = 0; j < N; j++) {
			var B = [], sign = ((i + j) % 2 == 0) ? 1 : -1;
			for (var m = 0; m < j; m++) {
				B[m] = [];
				for (var n = 0; n < i; n++)   B[m][n] = A[m][n];
				for (var n = i + 1; n < N; n++) B[m][n - 1] = A[m][n];
			}
			for (var m = j + 1; m < N; m++) {
				B[m - 1] = [];
				for (var n = 0; n < i; n++)   B[m - 1][n] = A[m][n];
				for (var n = i + 1; n < N; n++) B[m - 1][n - 1] = A[m][n];
			}
			adjA[i][j] = sign * (new euriklis.Mathematics.Matrix(B).Determinant());
		}
	}
	return new euriklis.Mathematics.Matrix(adjA);
}
/*Inverse matrix*/
euriklis.Mathematics.Matrix.prototype.InverseMatrix = function InverseMatrix() {
	A = this.M;
	if (A.length == 1 && A[0].length == 1) { A = [[1 / A[0][0]]]; }
	else {
		var det = new euriklis.Mathematics.Matrix(A).Determinant();
		if (det == 0) return false;
		var N = this.rows, A = this.Adjugate().M;
		for (var i = 0; i < N; i++) {
			for (var j = 0; j < N; j++) A[i][j] /= det;
		}
	}
	return new euriklis.Mathematics.Matrix(A);
}
euriklis.Mathematics.Matrix.prototype.compute = function () {
	/*
	 * doolitle LU decomposition and inverting of a matrix
   */
	a = this.M;
	function solve(a) {
		var n = a.length, l = new Array(n),
			u = new Array(n), b = new Array(n),
			d = new Array(n), x = new Array(n),
			c = new Array(n), coeff, i, j, k, det = 1;
		for (i = 0; i < n; i++) {
			l[i] = new Array(n);
			u[i] = new Array(n);
			b[i] = 0.0;
			c[i] = new Array(n);
			for (j = 0; j < n; j++) {
				l[i][j] = 0.0;
				u[i][j] = 0.0;
			}
		}
		for (k = 0; k < n - 1; k++) {
			for (i = k + 1; i < n; i++) {
				coeff = a[i][k] / a[k][k];
				l[i][k] = coeff;
				for (j = k + 1; j < n; j++) {
					a[i][j] -= coeff * a[k][j];
				}
			}
		}
		for (i = 0; i < n; i++)l[i][i] = 1.0;
		for (j = 0; j < n; j++) {
			for (i = 0; i <= j; i++)u[i][j] = a[i][j];
		}
		for (k = 0; k < n; k++) {
			b[k] = 1.0;
			d[0] = b[0];
			for (i = 1; i < n; i++) {
				d[i] = b[i];
				for (j = 0; j < i; j++) {
					d[i] -= l[i][j] * d[j];
				}
			}
			x[n - 1] = d[n - 1] / u[n - 1][n - 1];
			for (i = n - 2; i >= 0; i--) {
				x[i] = d[i];
				for (j = (n - 1); j > i; j--) {
					x[i] -= u[i][j] * x[j];
				}
				x[i] /= u[i][i];
			}
			for (i = 0; i < n; i++)c[i][k] = x[i];
			b[k] = 0.0;
		}
		for (i = 0; i < n; i++) det *= u[i][i];
		return { l: l, u: u, inv: c, det: det };
	}
	function inv(a) { return solve(a).inv; }
	function det(a) { return solve(a).det; }
	function LU(a) { return { l: solve(a).l.toMatrix(), u: solve(a).u.toMatrix() }; }
	return {
		inv: inv(a).toMatrix(),
		det: det(a),
		lu: LU(a),
		a: a
	}
};
/*identity matrix*/
euriklis.Mathematics.identity = function identity(n) {
	var I = new Array();
	for (var i = 0; i < n; i++) {
		I[i] = new Array();
		for (var j = 0; j < n; j++)I[i][j] = i == j ? 1 : 0;
	}
	return new euriklis.Mathematics.Matrix(I);
}
/*zero matrix*/
euriklis.Mathematics.zero = function zero(n) {
	var z = new Array();
	for (var i = 0; i < n; i++) {
		z[i] = new Array();
		for (var j = 0; j < n; j++)z[i][j] = 0;
	}
	return new euriklis.Mathematics.Matrix(z);
}
euriklis.Mathematics.Matrix.prototype.getRow = function getRow(row) {
	return new euriklis.Mathematics.Matrix(this.M[row]);
}
euriklis.Mathematics.Matrix.prototype.getColumn = function getColumn(col) {
	var matrix = this.M;
	var column = [];
	for (var i = 0; i < matrix.length; i++) {
		column.push([matrix[i][col]]);
	}
	return new euriklis.Mathematics.Matrix(column);
}
euriklis.Mathematics.Matrix.prototype.deleteCol = function deleteCol(colIndex) {
	var arr = this.M;
	for (var i = 0; i < arr.length; i++) {
		var row = arr[i];
		row.splice(colIndex, 1);
	}
	return new euriklis.Mathematics.Matrix(arr);
}
euriklis.Mathematics.Matrix.prototype.deleteRow = function deleteRow(RowIndex) {
	var arr = this.M;
	arr.splice(RowIndex, 1);
	return new euriklis.Mathematics.Matrix(arr);
}
euriklis.Mathematics.Matrix.prototype.getBlock = function getBlock(from, to) {
	var xo = euriklis.Mathematics.cloning(this).M;
	var s = euriklis.dimension(xo);
	function foo(xo, k) {
		var i, a = from[k], n = to[k] - a, ret = Array(n);
		if (k === s.length - 1) {
			for (i = n; i >= 0; i--) { ret[i] = xo[i + a]; }
			return ret;
		}
		for (i = n; i >= 0; i--) { ret[i] = foo(xo[i + a], k + 1); }
		return ret;
	}
	return new euriklis.Mathematics.Matrix(foo(xo, 0));
}
euriklis.Mathematics.Matrix.prototype.setBlock = function (from, to, setMatrix) {
	'use strict';
	let x = this, s = euriklis.dimension(x.M), sm = euriklis.Mathematics.cloning(setMatrix).M;
	function foo(x, y, k) {
		let i, a = from[k], n = to[k] - a;
		if (k === s.length - 1) { for (i = n; i >= 0; i--) { x[i + a] = y[i]; } }
		for (i = n; i >= 0; i--) { foo(x[i + a], y[i], k + 1); }
	}
	foo(x.M, sm, 0);
	return x;
}
euriklis.Mathematics.Matrix.prototype.addLastRow = function addLastRow(_row_) {
	var _vector_ = _row_.constructor === Array && _row_.toMatrix().rows === 1 && _row_.toMatrix().columns === this.columns ? _row_ :
		_row_.constructor === euriklis.Mathematics.Matrix && _row_.rows === 1 && _row_.columns === this.columns ? _row_.M :
			euriklis.nrerror('Incorrect input of the row parameter');
	this.rows += 1;
	this.M.push(_vector_);
	return this;
}
euriklis.Mathematics.Matrix.prototype.addFirstRow = function addFstRow(_row_) {
	var _vector_ = _row_.constructor === Array && _row_.toMatrix().rows === 1 && _row_.toMatrix().columns === this.columns ? _row_ :
		_row_.constructor === euriklis.Mathematics.Matrix && _row_.rows === 1 && _row_.columns === this.columns ? _row_.M :
			euriklis.nrerror('Incorrect input of the row parameter');
	this.rows += 1;
	this.M.unshift(_vector_);
	return this;
}
euriklis.Mathematics.Matrix.prototype.addFirstColumn = function (_col_) {
	var _vector_ = _col_.constructor === Array && _col_.toMatrix().rows === this.rows &&
		_col_.toMatrix().columns === 1 ? _col_ :
		_col_.constructor === euriklis.Mathematics.Matrix && _col_.rows === this.rows &&
			_col_.columns === 1 ? _col_.M : euriklis.nrerror('Incorrect input of the column parameter');
	for (i = 0; i < this.rows; i++)this.M[i].unshift(_vector_[i][0]);
	this.columns += 1;
	return this;
}
euriklis.Mathematics.Matrix.prototype.addLastColumn = function (_col_) {
	var _vector_ = _col_.constructor === Array && _col_.toMatrix().rows === this.rows &&
		_col_.toMatrix().columns === 1 ? _col_ :
		_col_.constructor === euriklis.Mathematics.Matrix && _col_.rows === this.rows &&
			_col_.columns === 1 ? _col_.M : euriklis.nrerror('Incorrect input of the column parameter');
	for (i = 0; i < this.rows; i++)this.M[i].push(_vector_[i][0]);
	this.columns += 1;
	return this;
}
euriklis.Mathematics.Matrix.prototype.setting = function st(setObj, other_args) {
	var i, j, x = this.M;
	if (setObj.from && setObj.to && setObj.expression) {
		for (i = setObj.from[0]; i < setObj.to[0]; i++) {
			for (j = setObj.from[1]; j < setObj.to[1]; j++)x[i][j] = eval(setObj.expression);
		}
		return x.toMatrix();
	}
	else { euriklis.nrerror('Incorrect input of set Object!'); }
}
euriklis.Mathematics.Matrix.prototype.typicalForm = function () {
	var inputx = euriklis.Mathematics.cloning(this),
		sx = new Array();
	for (var i = 0; i < inputx.rows; i++) {
		sx[i] = new Array();
		for (var j = 0; j < inputx.columns; j++) {
			sx[i][j] = (inputx.M[i][j] - euriklis.Econometrics.MEAN(inputx.getColumn(j).transpose().M[0])) / Math.sqrt(euriklis.Econometrics.VAR(inputx.getColumn(j).transpose().M[0]));
		}
	}
	return sx.toMatrix();
}
euriklis.Mathematics.Matrix.prototype.rdiff = function () {
	var inputx = euriklis.Mathematics.cloning(this);
	var outputx = euriklis.Mathematics.createMatrix(this.rows - 1, this.columns);
	for (i = 0; i < this.rows - 1; i++) {
		for (j = 0; j < this.columns; j++)outputx.M[i][j] = (inputx.M[i + 1][j] - inputx.M[i][j]) / inputx.M[i][j];
	}
	return outputx;
}
euriklis.Mathematics.Matrix.prototype.divergenceForm = function () {
	var inputx = euriklis.Mathematics.cloning(this),
		dx = new Array();
	for (var i = 0; i < inputx.rows; i++) {
		dx[i] = new Array();
		for (var j = 0; j < inputx.columns; j++) {
			dx[i][j] = (inputx.M[i][j] - euriklis.Econometrics.MEAN(inputx.getColumn(j).transpose().M[0]));
		}
	}
	return dx.toMatrix();
}
euriklis.Mathematics.Matrix.prototype.isSquare = function () {
	return this.rows === this.columns;
}
euriklis.Mathematics.Matrix.prototype.isSameWith = function (B, precision) {
	var A = this, B = euriklis.Mathematics.cloning(B), i, j,
		na = A.rows, ma = A.columns, nb = B.rows, mb = B.columns,
		epsilon = precision ? precision : 1e-16, isSame = true;//ε--> a small number
	if (na == nb && ma == mb) {
		for (i = 0; i < na; i++) {
			for (j = 0; j < ma; j++)if (A.M[i][j] - B.M[i][j] > epsilon) { isSame = false; break; }
		}
		return isSame;
	} else return false;
}
euriklis.Mathematics.Matrix.prototype.isSymetric = function () {
	var i, j, isSymetric = true, a = this.M,
		n = this.rows, matrixIsSquare = this.isSquare();
	if (matrixIsSquare) {
		for (i = 0; i < n; i++) {
			for (j = 0; j < n; j++)if (a[i][j] !== a[j][i]) { isSymetric = false; break; }
		}
		return isSymetric;
	} else euriklis.nrerror('Non square matrix input!');
}
euriklis.Mathematics.Matrix.prototype.reshape = function (m, n) {
	'use strict';
	const a = this.M, ar = this.rows, ac = this.columns;
	let b = new Array(m);
	if (ar * ac !== m * n) throw new Error(`this matrix can not be reshaped in sizes ${m} and ${n}`);
	else {
		let i = 0, j = 0, s = 0, t = 0;
		while (1) {
			if (i === m && j !== n) {
				i = 0;
				++j;
			}
			if (s === ar && t !== ac) {
				s = 0;
				++t;
			}
			if (j === 0) b[i] = new Array(n);
			if (j === n && t === ac) break;
			b[i][j] = a[s][t];
			++i;
			++s;
		}
	}
	return b.toMatrix();
}
euriklis.Mathematics.Matrix.prototype.getDiagonal = function () {
	var j, diag = euriklis.Mathematics.createMatrix(1, this.rows);
	for (j = 0; j < this.rows; j++) diag.M[0][j] = this.M[j][j];
	return diag;
}
euriklis.Mathematics.Matrix.prototype.stdOfRows = function () {
	var i, a = this;
	var std = euriklis.Mathematics.createMatrix(1, a.rows);
	for (i = 0; i < a.rows; i++) std.M[0][i] = Math.sqrt(euriklis.Econometrics.VAR(a.getRow(i).M));
	return std;
}
euriklis.Mathematics.Matrix.prototype.stdOfColumns = function () {
	var i, a = this, std = euriklis.Mathematics.createMatrix(1, a.columns);
	for (i = 0; i < a.columns; i++) std.M[0][i] = Math.sqrt(euriklis.Econometrics.VAR(a.getColumn(i).transpose().M[0]));
	return std;
}
euriklis.Mathematics.zeros = function (n, m) {
	return euriklis.Mathematics.createMatrix(n, m)
		.setting({
			from: [0, 0],
			to: [n, m],
			expression: 'x[i][j] = 0'
		})
}
euriklis.Mathematics.onces = function (n, m) {
	return euriklis.Mathematics.createMatrix(n, m)
		.setting({
			from: [0, 0],
			to: [n, m],
			expression: 'x[i][j] = 1'
		})
}
euriklis.Mathematics.replicate = function (number, n, m) {
	var i, j, err = "replicate routine:error number!";
	if (typeof number !== 'number') euriklis.nrerror(err)
	var rep = euriklis.Mathematics.createMatrix(n, m);
	for (i = 0; i < n; i++) {
		for (j = 0; j < m; j++) rep.M[i][j] = number;
	}
	return rep;
}
euriklis.Mathematics.Matrix.prototype.selectRowElements = function (row, from, to, step) {
	var i, seq = [], gr = this.getRow(row);
	if (from < to) {
		for (i = 0; from + i <= to; i += step) seq.push(from + i);
	} else {
		for (i = 0; from + i >= to; i += step) seq.push(from + i);
	}
	var rev = euriklis.Mathematics.createMatrix(1, seq.length);
	for (i = 0; i < rev.columns; i++) {
		rev.M[0][i] = gr.M[seq[i]]
	}
	return rev;
}
euriklis.Mathematics.Matrix.prototype.selectColumnElements = function (column, from, to, step) {
	var i, seq = [], gr = this.getColumn(column);
	if (from < to) {
		for (i = 0; from + i <= to; i += step) seq.push(from + i);
	} else {
		for (i = 0; from + i >= to; i += step) seq.push(from + i);
	}
	var rev = euriklis.Mathematics.createMatrix(seq.length, 1);
	for (i = 0; i < rev.rows; i++) {
		rev.M[i][0] = gr.M[seq[i]][0];
	}
	return rev;
}
euriklis.Mathematics.Matrix.prototype.add = function (number) {
	var i, j, a = euriklis.Mathematics.cloning(this);
	if (typeof number !== 'number') euriklis.nrerror('matrix add routine:The add function require only number type as argument');
	for (i = 0; i < this.rows; i++) {
		for (j = 0; j < this.columns; j++) a.M[i][j] += number;
	}
	return a;
}
euriklis.Mathematics.Matrix.prototype.sub = function (number) {
	var i, j, a = euriklis.Mathematics.cloning(this);
	if (typeof number !== 'number') euriklis.nrerror('matrix sub routine:The add function require only number type as argument');
	for (i = 0; i < this.rows; i++) {
		for (j = 0; j < this.columns; j++) a.M[i][j] -= number;
	}
	return a;
}
euriklis.Mathematics.Matrix.prototype.powerizeEachElement = function (num) {
	'use strict';
	let i, j, a = euriklis.Mathematics.cloning(this);
	for (i = 0; i < a.rows; i++) {
		for (j = 0; j < a.columns; j++) a.M[i][j] = Math.pow(a.M[i][j], num);
	}
	return a;
}
euriklis.Mathematics.Matrix.prototype.LUDecomposition = function () {
	//this algorithm is taken from the javscript library
	//numeric-js.If you want to modify the function to
	//make fast LU decomposition, change the variable A
	//"var A = this.M;", but then the original values of 
	//A will be changed and not saved.In the authentical 
	//function in numeric-js exists an another argument
	//i.e "fast" and if this argument exists the A do not
	//be saved its input values, else A is copy of the 
	//input matrix.
	//For an alternative algorithmthe for solving of LU 
	//see the ludcmp routine in the book "recipies in C".
	//An translation to javascript is given in the following 
	//coment from the author V.S.K.If you prefer this algorithm
	//decoment the code and coment the numeric code.
	/*
	//ROUTINE ludcmp:
	function ludcmp(){
	  var indx = new Array(),d = 1.0,
	   a = euriklis.Mathematics.cloning(this).M;
	   i,imax,j,k,n = a.length,
	   big,dum,sum,temp,
	   vv = new Array();//vv stores the implicit scaling of each row
	   for (i=1;i<=n;i++) {
			big=0.0; 
			for (j=1;j<=n;j++){
				if ((temp=Math.abs(a[i-1][j-1])) > big) big=temp;}
			if (big == 0.0) throw new error("Singular matrix in routine ludcmp");
			vv[i-1]=1.0/big; //Save the scaling.
	   }
	   for (j=1;j<=n;j++) {
		   for (i=1;i<j;i++) {
			   sum=a[i-1][j-1];
			   for (k=1;k<i;k++) sum -= a[i-1][k-1]*a[k-1][j-1];
			   a[i-1][j-1]=sum;
		   }
		   big=0.0;
		  for (i=j;i<=n;i++) { 
			  sum=a[i-1][j-1]; 
			  for (k=1;k<j;k++)sum -= a[i-1][k-1]*a[k-1][j-1];
			  a[i-1][j-1]=sum;
			  if ( (dum=vv[i-1]*Math.abs(sum)) >= big) {
				  big=dum;
				  imax=i;
			  }
		  }
		  if (j != imax) { 
			  for (k=1;k<=n;k++) {
				   dum=a[imax-1][k-1];
				   a[imax-1][k-1]=a[j-1][k-1];
				   a[j-1][k-1]=dum;
			  }
			  d = -d;
			  vv[imax-1]=vv[j-1];
		  }
		  indx[j-1]=imax-1;
		  if (a[j-1][j-1] == 0.0) a[j-1][j-1]=TINY;
		  if (j != n) {
			  dum=1.0/(a[j-1][j-1]);
			  for (i=j+1;i<=n;i++) a[i-1][j-1] *= dum;
		  }
	  }
  delete(vv);
  return {lu:a,d:d,indx:indx};
  }
	 */
	//|---starting of numeric-js algorithm---|
	var A = euriklis.Mathematics.cloning(this).M;
	var abs = Math.abs;
	var i, j, k, absAjk, Akk, Ak, Pk, Ai;
	var max;
	var n = A.length, n1 = n - 1;
	var P = new Array(n);
	for (k = 0; k < n; ++k) {
		Pk = k;
		Ak = A[k];
		max = abs(Ak[k]);
		for (j = k + 1; j < n; ++j) {
			absAjk = abs(A[j][k]);
			if (max < absAjk) {
				max = absAjk;
				Pk = j;
			}
		}
		P[k] = Pk;

		if (Pk != k) {
			A[k] = A[Pk];
			A[Pk] = Ak;
			Ak = A[k];
		}
		Akk = Ak[k];

		for (i = k + 1; i < n; ++i) {
			A[i][k] /= Akk;
		}

		for (i = k + 1; i < n; ++i) {
			Ai = A[i];
			for (j = k + 1; j < n1; ++j) {
				Ai[j] -= Ai[k] * Ak[j];
				++j;
				Ai[j] -= Ai[k] * Ak[j];
			}
			if (j === n1) Ai[j] -= Ai[k] * Ak[j];
		}
	}

	return {
		LU: A.toMatrix(),
		P: P.toMatrix()
	};
	//|---end of numeric-js algorithm---|
}
euriklis.Mathematics.Matrix.prototype.Cholesky_LL = function () {
	var i, k, j, sum, n = this.rows, A = this.M,
		L = euriklis.Mathematics.zero(n).M;
	for (i = 0; i < n; i++) {
		for (k = 0; k < (i + 1); k++) {
			sum = 0;
			for (j = 0; j < k; j++) {
				sum += L[i][j] * L[k][j];
			}
			L[i][k] = (i == k) ? Math.sqrt(A[i][i] - sum) :
				(1.0 / L[k][k] * (A[i][k] - sum));
		}
		if (A[i][i] - sum < 0) { euriklis.nrerror('The matrix is not positive!'); }
	}
	return !this.isSquare() ? euriklis.nrerror('Non square matrix input!') : L.toMatrix();
}
euriklis.Mathematics.Matrix.prototype.Cholesky_LDL = function () {
	var A = euriklis.Mathematics.cloning(this).M,
		L = new Array(), D = new Array(),
		d = new Array(), L1,
		i, i1, j, j1, k, k1, h, h1, sum, sum1, sum2, n = A.length;
	for (i = 0; i < n; i++) {
		L[i] = new Array(), D[i] = new Array();
		for (j = 0; j <= i; j++) {
			sum = 0.0, sum1 = 0;
			for (k = 0; k < j; k++) {
				sum += L[j][k] * L[j][k] * d[k];
				sum1 += L[i][k] * L[j][k] * d[k];
			}
			d[j] = A[j][j] - sum;
			L[i][j] = (A[i][j] - sum1) / d[j];
			D[i][j] = (i == j) ? d[j] : 0;
			for (h = i + 1; h < n; h++) { L[i][h] = 0; D[i][h] = 0; }
		}
	}
	return this.isSquare() ? { L: L.toMatrix(), D: D.toMatrix() } :
		euriklis.nrerror('Non square matrix input!');
}
euriklis.Mathematics.Matrix.prototype.toUpperHessenberg = function toUpperHessenberg() {
	/**
	 * initial declarations:
	 */
	var a = euriklis.Mathematics.cloning(this).M,// copy the matrix
		SIGN = sign = function (a, b) { return ((b) >= 0.0 ? Math.abs(a) : -Math.abs(a)); },
		n = a.length,
		I = euriklis.Mathematics.identity(n).M,
		alpha,
		r,
		u = new Array(n),
		p = new Array(),
		i, j, k, h, m;
	function _MultiplyMatrix_(A, B) {
		var rowsA = A.length, colsA = A[0].length,
			rowsB = B.length, colsB = B[0].length,
			C = [];
		//Need to be added an algorithm for 
		//fast matrix multiplication
		//this one is the conventional matrix 
		//multiplication algorithm 
		if (colsA != rowsB) return false;
		for (var i = 0; i < rowsA; i++) C[i] = [];
		for (var k = 0; k < colsB; k++) {
			for (var i = 0; i < rowsA; i++) {
				var t = 0;
				for (var j = 0; j < rowsB; j++) t += A[i][j] * B[j][k];
				C[i][k] = t;
			}
		}
		return C;
	}
	function _multMatrixNumber_(a, A) {
		var m = A.length, n = A[0].length, B = [];
		for (var i = 0; i < m; i++) {
			B[i] = [];
			for (var j = 0; j < n; j++) B[i][j] = a * A[i][j];
		}
		return B;
	}
	function _SumMatrix_(A, B) {
		var m = A.length, n = A[0].length, C = [];
		for (var i = 0; i < m; i++) {
			C[i] = [];
			for (var j = 0; j < n; j++) C[i][j] = A[i][j] + B[i][j];
		}
		return C;
	}
	function _TransMatrix_(A) {
		var m = A.length, n = A[0].length, AT = [];
		for (var i = 0; i < n; i++) {
			AT[i] = [];
			for (var j = 0; j < m; j++) AT[i][j] = A[j][i];
		}
		return AT;
	}
	for (k = 0; k < n - 2; k++) {
		var norm = 0.0;
		for (j = k + 1; j < n; j++) { norm += a[j][k] * a[j][k]; }
		norm = Math.sqrt(norm);
		if (norm <= 0) break;
		alpha = -sign(1, a[k + 1][k]) * norm;
		r = Math.sqrt(0.5 * (alpha * alpha - a[k + 1][k] * alpha));
		for (h = 0; h <= k; h++)u[h] = [0.0];
		u[k + 1] = [0.5 * (a[k + 1][k] - alpha) / r];
		for (m = k + 2; m < n; m++)u[m] = [0.5 * a[m][k] / r];
		p = _SumMatrix_(I, _multMatrixNumber_(-2, _MultiplyMatrix_(u, _TransMatrix_(u))));
		a = _MultiplyMatrix_(_MultiplyMatrix_(p, a), p);
	}
	return new euriklis.Mathematics.Matrix(a);
}
euriklis.Mathematics.Matrix.prototype.hqr = function hqr() {
	/*see hqr algorithm in C*/
	var a = this.M;
	/*a is an n-n square upper Hessenberg matrix!!!*/
	var n = a.length,
		wr = new Array(),
		wi = new Array(),
		nn, m, l, k, j, its, i, mmin, z, y, x, w, v, u, t, s, r, q, p, anorm,
		SIGN = sign = function (a, b) { return ((b) >= 0.0 ? Math.abs(a) : -Math.abs(a)); },
		IMAX = imax = function (fn, sn) { return Math.max(fn, sn); }, fabs = FABS = function (number) { return Math.abs(number); }, sqrt = Math.sqrt,
		nrerror = function (err) { throw new Error(err); }, a = euriklis.Mathematics.cloning(a).M;
	anorm = 0.0;
	for (i = 1; i <= n; i++) {
		for (j = IMAX(i - 1, 1); j <= n; j++)anorm += fabs(a[i - 1][j - 1]);
	}
	nn = n;
	t = 0.0;
	while (nn >= 1) {
		its = 0;
		do {
			for (l = nn; l >= 2; l--) {
				s = fabs(a[l - 2][l - 2]) + fabs(a[l - 1][l - 1]);
				if (s == 0.0) s = anorm;
				if ((fabs(a[l - 1][l - 2]) + s) == s) break;
			}
			x = a[nn - 1][nn - 1];
			if (l == nn) {
				wr[nn - 1] = x + t;
				nn -= 1;
				wi[nn--] = 0.0;
				nn += 1;
			} else {
				y = a[nn - 2][nn - 2];
				w = a[nn - 1][nn - 2] * a[nn - 2][nn - 1];
				if (l == (nn - 1)) {
					p = 0.5 * (y - x);
					q = p * p + w;
					z = sqrt(fabs(q));
					x += t;
					if (q >= 0.0) {
						z = p + SIGN(z, p);
						wr[nn - 2] = wr[nn - 1] = x + z;
						if (z) wr[nn - 1] = x - w / z;
						wi[nn - 2] = wi[nn - 1] = 0.0;
					} else {
						wr[nn - 2] = wr[nn - 1] = x + p;
						wi[nn - 2] = -(wi[nn - 1] = z);
					}
					nn -= 2;
				} else {
					if (its == 30) nrerror("Too many iterations in hqr");
					if (its == 10 || its == 20) {
						t += x;
						for (i = 1; i <= nn; i++) a[i - 1][i - 1] -= x;
						s = fabs(a[nn - 1][nn - 2]) + fabs(a[nn - 2][nn - 3]);
						y = x = 0.75 * s;
						w = -0.4375 * s * s;
					}
					++its;
					for (m = (nn - 2); m >= l; m--) {
						z = a[m - 1][m - 1];
						r = x - z;
						s = y - z;
						p = (r * s - w) / a[m][m - 1] + a[m - 1][m];
						q = a[m][m] - z - r - s;
						r = a[m + 1][m];
						s = fabs(p) + fabs(q) + fabs(r);
						p /= s;
						q /= s;
						r /= s;
						if (m == l) break;
						u = fabs(a[m - 1][m - 2]) * (fabs(q) + fabs(r));
						v = fabs(p) * (fabs(a[m - 2][m - 2]) + fabs(z) + fabs(a[m][m]));
						if ((u + v) == v) break;
					}
					for (i = m + 2; i <= nn; i++) {
						a[i - 1][i - 3] = 0.0;
						if (i != (m + 2)) a[i - 1][i - 4] = 0.0;
					}
					for (k = m; k <= nn - 1; k++) {
						if (k != m) {
							p = a[k - 1][k - 2];
							q = a[k][k - 2];
							r = 0.0;
							if (k != (nn - 1)) r = a[k + 1][k - 2];
							if ((x = fabs(p) + fabs(q) + fabs(r)) != 0.0) {
								p /= x;
								q /= x;
								r /= x;
							}
						}
						if ((s = SIGN(sqrt(p * p + q * q + r * r), p)) != 0.0) {
							if (k == m) {
								if (l != m)
									a[k - 1][k - 2] = -a[k - 1][k - 2];
							} else
								a[k - 1][k - 2] = -s * x;
							p += s;
							x = p / s;
							y = q / s;
							z = r / s;
							q /= p;
							r /= p;
							for (j = k; j <= nn; j++) {
								p = a[k - 1][j - 1] + q * a[k][j - 1];
								if (k != (nn - 1)) {
									p += r * a[k + 1][j - 1];
									a[k + 1][j - 1] -= p * z;
								}
								a[k][j - 1] -= p * y;
								a[k - 1][j - 1] -= p * x;
							}
							mmin = nn < k + 3 ? nn : k + 3;
							for (i = l; i <= mmin; i++) {
								p = x * a[i - 1][k - 1] + y * a[i - 1][k];
								if (k != (nn - 1)) {
									p += z * a[i - 1][k + 1];
									a[i - 1][k + 1] -= p * r;
								}
								a[i - 1][k] -= p * q;
								a[i - 1][k - 1] -= p;
							}
						}
					}
				}
			}
		} while (l < nn - 1);
	}
	return { real: wr, imaginary: wi };
}
euriklis.Mathematics.Matrix.prototype.eigenvalue = function eigenvalue() {
	var a = euriklis.Mathematics.cloning(this);
	return a.toUpperHessenberg().hqr();
}
euriklis.Mathematics.Matrix.prototype.jacobi = function (fast) {
	function jacobi(a) {
		var ROTATE = function ROTATE(a, i, j, k, l, g, s, h, tau) {
			g = a[i - 1][j - 1]; h = a[k - 1][l - 1]; a[i - 1][j - 1] = g - s * (h + g * tau);
			a[k - 1][l - 1] = h + s * (g - h * tau);
		}
		var j, iq, ip, i, n = a.length, v = [];
		var tresh, theta, tau, t, sm, s, h, g, c, b = [], z = [], d = [];
		for (ip = 1; ip <= n; ip++) {
			v[ip - 1] = [];
			for (iq = 1; iq <= n; iq++) v[ip - 1][iq - 1] = 0.0;
			v[ip - 1][ip - 1] = 1.0;
		}
		for (ip = 1; ip <= n; ip++) {
			b[ip - 1] = d[ip - 1] = a[ip - 1][ip - 1];
			z[ip - 1] = 0.0;
		}
		nrot = 0;
		for (i = 1; i <= 50; i++) {
			sm = 0.0;
			for (ip = 1; ip <= n - 1; ip++) {
				for (iq = ip + 1; iq <= n; iq++)sm += Math.abs(a[ip - 1][iq - 1]);
			}
			if (sm == 0.0) {
				//z = [];
				//b = z;
				//return;
				//just nothing...
			}
			if (i < 4)
				tresh = 0.2 * sm / (n * n);
			else
				tresh = 0.0;
			for (ip = 1; ip <= n - 1; ip++) {
				for (iq = ip + 1; iq <= n; iq++) {
					g = 100.0 * Math.abs(a[ip - 1][iq - 1]);
					if (i > 4 && (Math.abs(d[ip - 1]) + g) == Math.abs(d[ip - 1])
						&& (Math.abs(d[iq - 1]) + g) == Math.abs(d[iq - 1]))
						a[ip - 1][iq - 1] = 0.0;
					else if (Math.abs(a[ip - 1][iq - 1]) > tresh) {
						h = d[iq - 1] - d[ip - 1];
						if ((Math.abs(h) + g) == Math.abs(h)) t = (a[ip - 1][iq - 1]) / h;
						else {
							theta = 0.5 * h / (a[ip - 1][iq - 1]);
							t = 1.0 / (Math.abs(theta) + Math.sqrt(1.0 + theta * theta));
							if (theta < 0.0) t = -t;
						}
						c = 1.0 / Math.sqrt(1 + t * t);
						s = t * c;
						tau = s / (1.0 + c);
						h = t * a[ip - 1][iq - 1];
						z[ip - 1] -= h;
						z[iq - 1] += h;
						d[ip - 1] -= h;
						d[iq - 1] += h;
						a[ip - 1][iq - 1] = 0.0;
						for (j = 1; j <= ip - 1; j++) {
							ROTATE(a, j, ip, j, iq, g, s, h, tau)
						}
						for (j = ip + 1; j <= iq - 1; j++) {
							ROTATE(a, ip, j, j, iq, g, s, h, tau)
						}
						for (j = iq + 1; j <= n; j++) {
							ROTATE(a, ip, j, iq, j, g, s, h, tau)
						}
						for (j = 1; j <= n; j++) {
							ROTATE(v, j, ip, j, iq, g, s, h, tau)
						}
						++(nrot);
					}
				}
			}
			for (ip = 1; ip <= n; ip++) {
				b[ip - 1] += z[ip - 1];
				d[ip - 1] = b[ip - 1];
				z[ip - 1] = 0.0;
			}

			//console.log(d);
		}
		//throw new Error("Too many iterations in routine jacobi");
		return { eigenvalues: d, eigenvectors: v.toMatrix() };
	}
	var mtx = euriklis.Mathematics.cloning(this);
	fast = fast || false;
	if (!fast) {
		if (mtx.isSymetric()) return jacobi(mtx.M);
		else throw new Error('Non symetric matrix as input')
	} else return jacobi(mtx.M);
}

euriklis.Mathematics.Matrix.prototype.QR = function (properties) {
	'use strict';
	/**
	 * set initial utility functions:
	 */
	const sgn = (x) => {
		return x / Math.abs(x);
	},
		abs = Math.abs, sqrt = Math.sqrt,
		pythag = (a, b) => {
			return b > a ? b * sqrt(1 + a * a / (b * b))
				: b < a ? a * sqrt(1 + b * b / (a * a)) : b * sqrt(2);
		};
	/**
	 * set the properties:
	 */
	let existsProp = properties || false,
		existsPropType = existsProp ? (properties.type === "Householder"
			|| properties.type === "Givens"
			|| properties.type === "Gram-Schmidt"
			|| properties.type === "Gram-Schmidt with reorthogonization"
			|| properties.type === "Gram-Schmidt Ritzit source") : false,
		existsPropStepping = existsProp && typeof properties.stepByStep !== "undefined";
	if (existsProp) {
		if (existsPropType) {
			if (existsPropStepping) {
				properties = properties;
			} else properties.stepByStep = false;
		} else properties.type = "Householder"
	} else properties = { type: "Householder", stepByStep: false };
	let givens = (x, i, j) => {
		const p = pythag(x.M[i][0], x.M[j][0]),
			c = x.M[i][0] / p,
			s = - x.M[j][0] / p,
			n = x.rows;
		let G = euriklis.Mathematics.identity(n);
		G.M[i][i] = c;
		G.M[j][j] = c;
		G.M[i][j] = -s;
		G.M[j][i] = s;
		return G;
	};
	let k, i, j, n = this.columns, m = this.rows,
		R = euriklis.Mathematics.cloning(this), H, G,
		Q = euriklis.Mathematics.identity(m);
	if (properties.type === "Householder") {
		for (j = 0; j < n; j++) {
			/**
			 * Find H = I - tau*u*u' to put
			 * zeros bellow R.M[j][j]...
			 */
			let s = - sgn(R.M[j][j]),
				normx = R.getBlock([j, j], [m - 1, j]).FrobeniusNorm(),
				u1 = R.M[j][j] - s * normx,
				u = R.getBlock([j, j], [m - 1, j]).times(1 / u1),
				tau = -s * u1 / normx;
			u.M[0][0] = 1;
            /**
			 * R = HR and Q = QH...
			 */
			let r_from = [j, j], r_to = [m - 1, n - 1],
				RJ = R.getBlock(r_from, r_to);
			R.setBlock(r_from, r_to,
				RJ.minus(
					u.times(tau)
						.times(u.transpose().times(RJ))
				)
			);
			let q_from = [0, j], q_to = [m - 1, m - 1],
				QJ = Q.getBlock(q_from, q_to);
			Q.setBlock(q_from, q_to,
				QJ.minus(QJ.times(u).times(u.times(tau).transpose()))
			)
		}
	} else {
		if (properties.type === "Givens") {
			for (i = 0; i < n; i++) {
				for (j = i + 1; j < m; j++) {
					G = givens(R.getColumn(i), i, j);
					R = G.times(R);
					Q = Q.times(G.transpose())
				}
			}
		} else {
			if (properties.type === "Gram-Schmidt") {
				Q = this, R = euriklis.Mathematics.zero(n)
				for (k = 0; k < n; k++) {
					let from = [0, k], to = [Q.rows - 1, k];
					for (i = 0; i < k; i++) {
						R.M[i][k] = Q.getColumn(i)
							.transpose()
							.times(Q.getColumn(k)).M[0][0];
					}
					for (i = 0; i < k; i++) {
						let Qk = Q.getColumn(k),
							Qi = Q.getColumn(i);
						Q.setBlock(from, to, Qk.minus(Qi.times(R.M[i][k])));
					}
					R.M[k][k] = Q.getColumn(k).FrobeniusNorm();
					Q.setBlock(from, to, Q.getColumn(k).times(1 / R.M[k][k]))
				}
			} else {
				if (properties.type === "Gram-Schmidt with reorthogonization") {
					R = euriklis.Mathematics.zero(n), Q = this;
					for (k = 0; k < n; k++) {
						let t = 0, tt = 0, reorthogonization = 1;
						/**
						 * set t = Qk'Qk 
						 */
						for (j = 0; j < m; j++) t += Q.M[j][k] * Q.M[j][k];
						while (reorthogonization) {
							for (i = 0; i < k; i++) {
								/**
								 * set s = Qi'Qk, i = 1,2...k
								 */
								let s = 0;
								for (j = 0; j < m; j++) s += Q.M[j][i] * Q.M[j][k];
								if (tt === 0) R.M[i][k] = s;
								/**
								 * set Qk = Qk - s*Qi, i = 1,2...k
								 */
								for (j = 0; j < m; j++) Q.M[j][k] -= s * Q.M[j][i];
							}
							tt = 0;
							for (j = 0; j < m; j++) tt += Q.M[j][k] * Q.M[j][k];
							reorthogonization = 0;
							if (tt < t / 100) {
								t = tt; reorthogonization = 1;
							}
						}
						R.M[k][k] = sqrt(tt);
						for (j = 0; j < m; j++) Q.M[j][k] /= R.M[k][k];
					}
				} else {
					if (properties.type === "Gram-Schmidt Ritzit source") {
						let eps = 2.220446049250313e-16, z = [];// 2^-52
						Q = this, R = euriklis.Mathematics.zero(n);
						for (k = 0; k < n; k++) {
							let t = 0, tt = 0;
							for (j = 0; j < m; j++) t += Q.M[j][k] * Q.M[j][k];
							t = sqrt(t);
							let nach = 1, u = 0;
							while (nach) {
								u += 1;
								for (i = 0; i < k; i++) {
									// s = Qi'Qk
									let s = 0;
									for (j = 0; j < m; j++) s += Q.M[j][i] * Q.M[j][k];
									R.M[i][k] += s;
									for (j = 0; j < m; j++) Q.M[j][k] -= s * Q.M[j][i];
								}
								tt = 0;
								for (j = 0; j < m; j++) tt += Q.M[j][k] * Q.M[j][k];
								tt = sqrt(tt);
								if (tt > 10 * eps * t && tt < t / 10) {
									nach = 1;
									t = tt;
								} else {
									nach = 0;
									if (tt < 10 * eps * t) tt = 0;
								}
							}
							z.push(u);
							R.M[k][k] = tt;
							if (tt * eps !== 0) tt = 1 / tt; else tt = 0;
							for (j = 0; j < m; j++) Q.M[j][k] *= tt;
						}
					}
				}
			}
		}
	}
	return { Q: Q, R: R };
}

euriklis.Mathematics.Matrix.prototype.PCA = function (delLastN_cols) {
	var z = this.typicalForm(), i, j, k,
		r = euriklis.Econometrics.correlationMatrix(this);
	var eig = euriklis.Mathematics.cloning(r).jacobi();
	var order = eig.eigenvalues
		.toMatrix()
		.mergeSort()
		.coefficientsAssigment
		.reverse()
		.toMatrix()
		.transpose().M[0],
		cols = r.rows, l, log = delLastN_cols < cols,
		v = euriklis.Mathematics.createMatrix(cols, 0),
		part = euriklis.Mathematics.createMatrix(1, cols),
		L = euriklis.Mathematics.zero(cols), S, s, ss, Var, B, F;
	l = eig.eigenvalues
		.toMatrix()
		.mergeSort()
		.sort.M.reverse().toMatrix();
	for (i = 0; i < cols; i++) {
		i !== cols - 1 ? v.addLastColumn(eig.eigenvectors.getColumn(order[i])) :
			v.addLastColumn(eig.eigenvectors.getColumn(order[i]).times(-1));
		L.M[i][i] = Math.sqrt(l.M[i]);
		part.M[i] = i == 0 ? l.M[i] / l.SumOfElements() : part.M[i - 1] + (l.M[i] / l.SumOfElements());
	}
	S = v.times(L);
	log ? s = euriklis.Mathematics.cloning(S) : euriklis.nrerror('Internal error!');
	for (k = cols - 1; k >= cols - delLastN_cols; k--)s = s.deleteCol(k);
	ss = s.times(s.transpose());
	Var = euriklis.Mathematics.createMatrix(1, cols);
	for (j = 0; j < cols; j++)Var.M[j] = ss.M[j][j];
	B = v.times(L.InverseMatrix());
	F = z.times(B);
	return { r: r, l: l, v: v, part: part, S: S, ss: ss, B: B, F: F, var: Var }
}
euriklis.Mathematics.complex = function (real, imaginary) {
	this.Re = (!!(real % 1) || Number.isInteger(real)) && typeof real !== 'undefined' ?
		real : euriklis.nrerror('Incorrect complex declaration in Re!');
	this.Im = typeof imaginary === 'undefined' ? 0 :
		(!!(imaginary % 1) || Number.isInteger(imaginary)) ? imaginary :
			euriklis.nrerror('Incorrect complex declaration in Im');
}
euriklis.Mathematics.complex.prototype.plus = function (z) {
	var c = new euriklis.Mathematics.complex(this.Re, this.Im);
	(!!(z % 1) || Number.isInteger(z)) ? c.Re += z : z.constructor === euriklis.Mathematics.complex ?
		(c.Re += z.Re, c.Im += z.Im) :
		euriklis.nrerror('Uncorrect input in plus complex routine!');
	return c;
}
euriklis.Mathematics.complex.prototype.times = function (z) {
	var ct = new euriklis.Mathematics.complex(this.Re, this.Im);
	result = new euriklis.Mathematics.complex(0, 0);
	(!!(z % 1) || Number.isInteger(z)) ? (result.Re = ct.Re * (z), result.Im = ct.Im * (z)) :
		z.constructor === euriklis.Mathematics.complex ?
			(result.Re = ct.Re * z.Re - ct.Im * z.Im, result.Im = ct.Re * z.Im + ct.Im * z.Re) :
			euriklis.nrerror('Uncorrect input in times complex routine!');
	return result;
}
euriklis.Mathematics.complex.prototype.minus = function (z) {
	var cm = new euriklis.Mathematics.complex(this.Re, this.Im);
	(!!(z % 1) || Number.isInteger(z)) ? cm.Re -= (z) : z.constructor === euriklis.Mathematics.complex ?
		cm = cm.plus(z.times(-1)) :
		euriklis.nrerror('Uncorrect input in minus complex routine!');
	return cm;
}
euriklis.Mathematics.complex.prototype.condjugate = function () {
	return new euriklis.Mathematics.complex(this.Re, -this.Im);
}
euriklis.Mathematics.complex.prototype.division =
	euriklis.Mathematics.complex.prototype.divide = function (z) {
		var cd = new euriklis.Mathematics.complex(this.Re, this.Im),
			zd = (!!(z % 1) || Number.isInteger(z)) ? new euriklis.Mathematics.complex(z) :
				z.constructor === euriklis.Mathematics.complex ? z :
					euriklis.nrerror('Uncorrect input in the division routine!');
		return cd.times(zd.condjugate()).times(1 / (zd.Re * zd.Re + zd.Im * zd.Im));
	}
euriklis.Mathematics.complex.prototype.arg = function () {
	return Math.atan2(this.Im, this.Re);
}
euriklis.Mathematics.complex.prototype.abs = function () {
	var a = Math.abs(this.Re), b = Math.abs(this.Im);
	return a > b ? a * Math.sqrt(1 + b * b / a * a) : b == 0 ? 0 : b * Math.sqrt(1 + a * a / b * b);
}
euriklis.Mathematics.complex.prototype.power = function (n) {
	var result = new euriklis.Mathematics.complex(this.Re, this.Im);
	if (Number.isInteger(n)) {
		if (n > 0) {
			var i;
			for (i = 1; i < n; i++)result = result.times(this);
		}
		else {
			if (n === 0) result = new euriklis.Mathematics.complex(1, 0);
			else {
				result = new euriklis.Mathematics.complex(1).division(result.power(-n));
			}
		}
	}
	else {
		n = (!!(n % 1)) ? new euriklis.Mathematics.complex(n) :
			n.constructor === euriklis.Mathematics.complex ? n :
				euriklis.nrerror('Uncorrect input in complex power routine!');
		var pythag = function (a, b) {
			/**
			 * return the (a^2 + b^2)^0.5
			 */
			var absa = Math.abs(a), absb = Math.abs(b);
			return (absa > absb ? absa * Math.sqrt(1.0 + (absb / absa) * (absb / absa)) :
				(absb == 0.0 ? 0.0 : absb * Math.sqrt(1.0 + (absa / absb) * (absa / absb))));
		}
		var multiplicator = Math.exp(-n.Im * this.arg()) * Math.pow(pythag(this.Re, this.Im), n.Re);
		var term = n.Re * this.arg() + 0.5 * n.Im * Math.log(this.Re * this.Re + this.Im * this.Im)
		result.Re = multiplicator * Math.cos(term);
		result.Im = multiplicator * Math.sin(term);
		result.times(multiplicator);
	}
	return result;
}
euriklis.Mathematics.complex.prototype.exp = function () {
	'use strict';
	let a = this, exp = Math.exp,
		cos = Math.cos, sin = Math.sin,
		z = euriklis.Mathematics.complex;
	return new z(exp(a.Re) * cos(a.Im), exp(a.Re) * sin(a.Im));
}
euriklis.Mathematics.complex.prototype.cabs = function () {
	'use strict'
	/**
	 * Linda Kaufman complex norm for LZ algorithm:
	 */
	return Math.abs(this.Re) + Math.abs(this.Im)
}
euriklis.Mathematics.complexPolynomials = function (coeff) {
	var c = coeff.constructor === Array ? coeff :
		euriklis.nrerror('Uncorrect input of pol routine!');
	this.coefficients = c;
}
euriklis.Mathematics.complexPolynomials.prototype.unitModify = function () {
	var p = this.coefficients.length - 1, coef = this.coefficients;
	return new euriklis.Mathematics.complexPolynomials(
		coef[p] !== 1 ?
			coef.map(function (x) {
				return x / coef[p];
			}) : this.coefficients);
}
euriklis.Mathematics.complexPolynomials.prototype.solveAt = function (point) {
	var i, result = new euriklis.Mathematics.complex(0, 0);
	var p = (!!(point % 1)) || Number.isInteger(point) ?
		new euriklis.Mathematics.complex(point) :
		point.constructor === euriklis.Mathematics.complex ? point :
			euriklis.nrerror('Uncorrect point input at solveAt routine!');
	for (i = 0; i < this.coefficients.length; i++)result = result.plus(p.power(i).times(this.coefficients[i]));
	return result;
}
euriklis.Mathematics.complexPolynomials.prototype.roots = function (requires) {
	/*
	This routine obtains all posible roots of an complex polynomial.The routine 
    uses the Durand–Kerner method for the finding-root procedure and the complex
    type properties.The error estimation is based on the absolute value of the 
    complex root differential and if the user would like can change it with
    ".Re>tiny&&.Im>tiny". So the equation of the algorithm is the follow:
    x[i][k] = x[i][k-1] - P(x[i][k-1])/Product{j=0 to j=n and i!=j}(x[i][k-1]-x[j][k-1]),
    where k --> number of the iteration and i the i-the root of the polynomial.
    As input the user if he wants can include the precision and the start point in an object type
    like that: "{precision:1e-27,startPoint:[2,0]}".
	*/
	var tiny = typeof requires !== 'undefined' ? (typeof requires.precision === 'undefined' ? 1e-8 : requires.precision) : 1e-8,
		startPoint = typeof reqires !== 'undefined' ? (typeof requires.startPoint === 'undefined' ? [0.4, 0.9] : requires.startPoint) : [0.4, 0.9],
		complex = euriklis.Mathematics.complex, i, j, k, m, g, h,
		x = [[], []], n = this.coefficients.length - 1, loopIsNeeded = true, iterations = 0;
	for (i = 0; i < n; i++) {
		x[0][i] = new complex(0, 0);
		x[1][i] = new complex(startPoint[0], startPoint[1]).power(i);
	}
	while (loopIsNeeded) {
		for (k = 0; k < n; k++) {
			if (x[1][k].minus(x[0][k]).abs() > tiny) {
				loopIsNeeded = true;
				break;
			} else loopIsNeeded = false;
		}
		var qx = new Array();
		for (h = 0; h < n; h++)x[0][h] = x[1][h];
		for (j = 0; j < n; j++) {
			qx[j] = this.unitModify().solveAt(x[0][j]);
			for (g = 0; g < n; g++) { qx[j] = (j !== g) ? qx[j].division(x[0][j].minus(x[0][g])) : qx[j].division(1); }
		}
		for (m = 0; m < n; m++) { x[1][m] = x[0][m].minus(qx[m]); }
		iterations += 1;
	}
	return { roots: x[1], iterations: iterations };
}
euriklis.Mathematics.complexMatrix = function (A, B) {
	/**
	 * This function creates a complex matrix object/type (cmo).
	 * You can create the cmo by three distinct ways.
	 * 1. If you insert only argument A (like Array or Matrix constructor)
	 * or some of elements of A is euriklis.Mathematics.complex constructor,
	 * then the matrix B will be ignored (if exists) and the cmo will be equal to
	 * the matrix C(i,j) = <Re(A(i,j),Im(0, Im(A(i,j)))>
	 * 2. If you insert arguments A(n,m) and B(n,m) (like Array or Matrix constructors)
	 * then the cmo will be equal to C(i,j) = <Re(A(i,j)),Im(B(i,j))>     
	 */
	'use strict';
	let i, j, c, a, b, hasB, a_ij_is_complex, a_contains_complex;
	// A and B not exists:
	if (typeof A === "undefined" && typeof B === "undefined") euriklis.nrerror("There are not inserted arguments")
	// B exists:
	if (typeof B !== "undefined") {
		// B is Array
		if (B.constructor === Array) {
			//hasB = "array"
			if (B.every(el => {
				return el.constructor === Array
			})) {
				let n = B[0].length
				if (B.every(el => {
					return el.length === n
				})) hasB = "array"
			}
		} else {
			//hasB = "matrix"
			if (B.constructor === euriklis.Mathematics.Matrix) {
				hasB = "matrix"
			} else euriklis.nrerror("Incorrect B type in complex matrix declaration.")
		}
	} else hasB = null
	//A is complex matrix
	if (A instanceof euriklis.Mathematics.complexMatrix) return A
	// A is array
	if (A.constructor === Array) {
		if (A.every(el => {
			return el.constructor === Array
		})) {
			let na = A.length
			if (A.every(el => {
				return el.length === na
			})) a = A
			else euriklis.nrerror("Incorrect length of the matrix A in the complex matrix declaration.")
		} else euriklis.nrerror("Incorrect Array declaration in complex matrix routine.")
	} else {
		if (A.constructor === euriklis.Mathematics.Matrix) {
			a = A.M
		} else euriklis.nrerror("Incorrect Array declaration.")
	}
	//A contains complex number:
	if (a.some(el => {
		return el.some(eli => {
			return eli.constructor === euriklis.Mathematics.complex
		})
	})) hasB = null
	if (hasB === "array") b = B
	if (hasB === "matrix") b = B.M
	c = [];
	for (i = 0; i < a.length; i++) {
		c[i] = [];
		for (j = 0; j < a[i].length; j++) {
			a_ij_is_complex = a[i][j].constructor === euriklis.Mathematics.complex
			if (hasB === null) c[i][j] = a_ij_is_complex ? a[i][j] : new euriklis.Mathematics.complex(a[i][j])
			else c[i][j] = new euriklis.Mathematics.complex(a[i][j], b[i][j])
		}
	}
	this.z = c
	this.rows = c.length
	this.columns = c[0].length
}
euriklis.Mathematics.complexMatrix.prototype.eigenProblemQZ = function (B, wantz) {
	'use strict';
	/**
	 * This code is translation of the fortran cqzhes, cqzval
	 * and cqzvec subroutines that are an analogue of the qz
	 * algorithm for solving generalized matrix eigenvalue 
	 * problems , SIAM. J. NUMER. ANAL. 10, 241-256 (1973) by 
	 * Moler and Steward.
	 */
	let a = this.z, b = B.z
	function cqzhes(a, b, wantz) {
		/**
		 * a and b are n × n complex matrices
		 * wantz is true if we want to obtain
		 * the eigenvectors of the eigenproblem.
		 * On output the a will be transformed
		 * to upper Hessenberg form. The elements bellow
		 * the first subdiagonal elements of a have been
		 * set to zero and the subdiagonal elements
		 * have been made real and non negative.
		 * If wantz is true, then z contains the
		 * products of the q (right hand transformations)
		 * for computing of the eigenvectors. 
		 */
		/**
		 * initializations:
		 */
		const outqzhes = () => {
			return {
				a: a,
				b: b,
				z: z
			}
		}, abs = Math.abs, sqrt = Math.sqrt,
			cmplx = euriklis.Mathematics.complex
		let i, j, k, n = a.length, k1, lb, l1,
			nm, nk1, nm1, r, s, t, ti, u1, u2, xi,
			xr, yi, yr, rho, u1i
		/**
		 * Initialize z: 
		 */
		if (wantz) {
			for (i = 0; i < n; i++) {
				for (j = 0; j < n; j++) {
					z[i][j] = new cmplx(0)
				}
				z[i][i] = new cmplx(1)
			}
		}
		/**
		 * reduce b to upper triangular form
		 * with temporaly real diagonal elements
		 */
		if (n === 1) return outqzhes()
		nm1 = n - 1
		for (l = 0; l < nm1; l++) {
			l1 = l + 1
			s = 0.0
			for (i = 0; i < n; i++) {
				s += b[i][l].cabs()
			}
			if (s === 0.0) continue
			rho = 0.0
			for (i = l; i < n; i++) {
				b[i][l] = b[i][l].divide(s)
				rho += b[i][l].Re * b[i][l].Re + b[i][l].Im * b[i][l].Im
			}
			r = sqrt(rho)
			xr = b[l][l].abs()
			if (xr !== 0) {
				rho += xr * r
				u1 = -b[l][l].Re / xr
				u1i = -b[l][l].Im / xr
				yr = r / xr + 1.0
				b[l][l] = b[l][l].times(yr)
			} else {
				b[l][l].Re = r
				u1 = -1
				u1i = 0.0
			}
			for (j = l1; j < n; j++) {
				t = 0.0
				ti = 0.0
				for (i = l; i < n; i++) {
					t += b[i][l].Re * b[i][j].Re + b[i][l].Im * b[i][j].Im
					ti += b[i][l].Re * b[i][j].Im - b[i][l].Im * b[i][j].Re
				}
				t /= rho
				ti /= rho
				for (i = l; i < n; i++) {
					b[i][j].Re += -t * b[i][l].Re + ti * b[i][l].Im
					b[i][j].Im += -t * b[i][l].Im + ti * b[i][l].Re
				}
				xi = u1 * b[l][j].Im - u1i * b[l][j].Re
				b[l][j].Re = u1 * b[l][j].Re + u1i * b[l][j].Im
				b[l][j].Im = xi
			}
			for (j = 0; j < n; j++) {
				t = 0.0
				ti = 0.0
				for (i = l; i < n; i++) {
					t += b[i][l].Re * a[i][j].Re + b[i][l].Im * a[i][j].Im
					ti += b[i][l].Re * a[i][j].Im - b[i][l].Im * a[i][j].Re
				}
				t /= rho
				ti /= rho
				for (i = l; i < n; i++) {
					a[i][j].Re += - t * b[i][l].Re + ti * b[i][l].Im
					a[i][j].Im += - t * b[i][l].Im - ti * b[i][l].Re
				}
				xi = u1 * a[l][j].Im - u1i * a[l][j].Re
				a[l][j].Re = u1 * a[l][j].Re + u1i * a[l][j].Im
				a[l][j].Im = xi
			}
			b[l][l].Re = r * s
			b[l][l].Im = 0.0
			for (i = l1; i < n; i++) {
				b[i][l] = new cmplx(0)
			}
		}
		/**
		 * reduce a to upper Hessenberg form
		 * with real subdiagonal elements
		 * keeping b triangular ...
		 */
		for (k = 0; k < nm1; k++) {
			k1 = k + 1
			r = a[nm1][k].abs()
			if (r !== 0.0) {
				u1 = a[nm1][k].Re / r
				u1i = a[nm1][k].Im / r
				a[nm1][k].Re = r
				a[nm1][k].Im = 0.0
				for (j = k1; j < n; j++) {
					xi = u1 * a[nm1][j].Im - u1i * a[nm1][j].Re
					a[nm1][j].Re = u1 * a[nm1][j].Re + u1i * a[nm1][j].Im
					a[nm1][j].Im = xi
				}
				xi = u1 * b[nm1][nm1].Im - u1i * b[nm1][nm1].Re
				b[nm1][nm1].Re = u1 * b[nm1][nm1].Re + u1i * b[nm1][nm1].Im
				b[nm1][nm1].Im = xi
			}
			if (k === n - 2) return outqzhes()
			nk1 = nm1 - k
			/**
			 * for l = n - 1, step -1 
			 * until k + 1, do:
			 */
			for (lb = 0; lb < nk1; lb++) {
				l = nm1 - lb
				l1 = l + 1
				/**
				 * zero a[l + 1][k]
				 */
				s = abs(a[l][k].Re) + abs(a[l][k].Im) + abs(a[l1][k].Re)
				if (s === 0.0) continue
				u1 = a[l][k].Re / s
				u1i = a[l][k].Im / s
				u2 = a[l1][k].Re / s
				r = sqrt(u1 * u1 + u1i * u1i + u2 * u2)
				u1 /= r, u1i /= r, u2 /= r
				a[l][k].Re = r * s
				a[l][k].Im = 0.0
				a[l1][k].Re = 0.0
				for (j = k1; j < n; j++) {
					xr = a[l][j].Re
					xi = a[l][j].Im
					yr = a[l1][j].Re
					yi = a[l1][j].Im
					a[l][j].Re = u1 * xr + u1i * xi + u2 * yr
					a[l][j].Im = u1 * xi - u1i * xr + u2 * yi
					a[l1][j].Re = u1 * yr - u1i * yi - u2 * xr
					a[l1][j].Im = u1 * yi + u1i * yr - u2 * xi
				}
				xr = b[l][l].Re
				b[l][l].Re = u1 * xr
				b[l][l].Im = -u1i * xr
				b[l1][l].Re = -u2 * xr
				for (j = l1; j < n; j++) {
					xr = b[l][j].Re
					xi = b[l][j].Im
					yr = b[l1][j].Re
					yi = b[l1][j].Im
					b[l][j].Re = u1 * xr + u1i * xi + u2 * yr
					b[l][j].Re = u1 * xi - u1i * xr + u2 * yi
					b[l1][j].Re = u1 * yr - u1i * yi - u2 * xr
					b[l1][j].Im = u1 * yi + u1i * yr - u2 * xi
				} // 120
				/**
				 * zero b[l + 1][l] 
				 */
				s = b[l1][l1].cabs() + abs(b[l1][l].Re)
				if (s === 0.0) continue
				u1 = b[l1][l1].Re / s
				u1i = b[l1][l1].Im / s
				u2 = b[l1][l].Re / s
				r = sqrt(u1 * u1 + u1i * u1i + u2 * u2)
				u1 /= r
				u1i /= r
				u2 /= r
				b[l1][l1].Re = r * s
				b[l1][l1].Im = 0.0
				b[l1][l].Re = 0.0
				for (i = 0; i <= l; i++) {
					xr = b[i][l1].Re
					xi = b[i][l1].Im
					yr = b[i][l].Re
					yi = b[i][l].Im
					b[i][l1].Re = u1 * xr + u1i * xi + u2 * yr
					b[i][l1].Im = u1 * xi - u1i * xr + u2 * yi
					b[i][l].Re = u1 * yr - u1i * yi - u2 * xr
					b[i][l].Im = u1 * yi + u1i * yr - u2 * xi
				}
				for (i = 0; i < n; i++) {
					xr = a[i][l1].Re
					xi = a[i][l1].Im
					yr = a[i][l].Re
					yi = a[i][l].Im
					a[i][l1].Re = u1 * xr + u1i * xi + u2 * yr
					a[i][l1].Im = u1 * xi - u1i * xr + u2 * yi
					a[i][l].Re = u1 * yr - u1i * yi - u2 * xr
					a[i][l].Im = u1 * yi + u1i * yr - u2 * xi
				}
				if (!wantz) continue
				for (i = 0; i < n; i++) {
					xr = z[i][l1].Re
					xi = z[i][l1].Im
					yr = z[i][l].Re
					yi = z[i][l].Im
					z[i][l1].Re = u1 * xr + u1i * xi + u2 * yr
					z[i][l1].Im = u1 * xi - u1i * xr + u2 * yi
					z[i][l].Re = u1 * yr - u1i * yi - u2 * xr
					z[i][l].Im = u1 * yi + u1i * yr - u2 * xi
				}
			}
		}
		return outqzhes()
	}
	function cqzval(a, b, z) {
		'use strict';
		let i, j, k, l, n = a.length, en, k1,
			k2, ll, l1, na, nm, its, km1, maxo,
			lm1, enm2, ierr, lor0, enorn,
			r, s, a1, a2, ep, sh, u1, u2,
			xi, xr, yi, yr, ani, a1i, a33,
			a34, a43, a44, bni, b11, b33,
			b44, shi, u1i, a33i, a34i, a43i,
			a44i, b33i, b44i, eps1 = 0.0, epsa,
			epsb, anorm, bnorm, b3344, b3344i,
			alfr = new Array(n), alfi = new Array(n),
			beta = new Array(n), wantz, z3, goto60,
			goto70
		const abs = Math.abs, sqrt = Math.sqrt,
			cmplx = euriklis.Mathematics.complex
		/**
		 * this function is a javascript 
		 * translatiom of the fortran 
		 * subroutine "cqzval" that is 
		 * a complex analogue of steps
		 * 2 and 3 of the QZ algorithm
		 * as modified in technical note
		 * NASA TN E-7305 (1973) by Ward
		 */
		ierr = 0
		/**
		 * compute epsa and epsb
		 */
		anorm = 0.0
		bnorm = 0.0
		// start 30
		for (i = 0; i < n; i++) {
			ani = 0.0
			if (i !== 0.0) ani = abs(a[i][i - 1].Re)
			bni = 0.0
			// start 20
			for (j = i; j < n; j++) {
				ani += a[i][j].cabs()
				bni += b[i][j].cabs()
			}
			//end 20
			if (ani > anorm) anorm = ani
			if (bni > bnorm) bnorm = bni
		}
		// end 30
		if (anorm === 0.0) anorm = 1.0
		if (bnorm === 0.0) bnorm = 1.0
		ep = eps1
		if (ep === 0.0) {
			/**
			 * compute rounoff level
			 * if eps1 is zero...
			 */
			ep = 1.0
			do {
				ep *= 0.5
			} while (1.0 + ep > 1.0)
		}
		epsa = ep * anorm
		epsb = ep * bnorm
		/**
		 * reduce A to upper triangular
		 * form while keeping B triangular
		 */
		lor0 = 0
		enorn = n - 1
		en = n - 1
		/**
		 * begin QZ step:
		 */
		//start 60:
		do {
			goto60 = 0
			if (en === -1) {
				/**
				 * save epsb for use by
				 * qzvec ...
				 */
				if (n - 1 > 0) b[n - 1][0] = epsb
				return outqzval()
			}
			if (!wantz) enorn = en
			its = 0
			na = en - 1
			enm2 = na - 1
			/**
			 * check for convergence or
			 * reducibility. For l = en,
			 * step = -1, until 1 do ...
			 */
			// start 70:
			do {
				goto70 = 0
				for (ll = 0; ll <= en; ll++) {
					lm1 = en - ll - 1
					l = lm1 + 1
					if (l === 0) break // go to 95
					if (abs(a[l][lm1].Re) <= epsa) break // go to 90
				}
				// start 90:
				do {
					if (l !== 0) a[l][lm1].Re = 0.0
					/**
					 * set diagonal elements at
					 * top of b real ...
					 */
					// label 95
					b11 = b[l][l].abs()
					if (b11 !== 0.0) {
						u1 = b[l][l].Re / b11
						u1i = b[l][l].Im / b11
						for (j = l; j <= enorn; j++) {
							xi = u1 * a[l][j].Im - u1i * a[l][j].Re
							a[l][j].Re = u1 * a[l][j].Re + u1i * a[l][j].Im
							a[l][j].Im = xi
							xi = u1 * b[l][j].Im - u1i * b[l][j].Re
							b[l][j].Re = u1 * b[l][j].Re + u1i * b[l][j].Im
							b[l][j].Im = xi
						}
						b[l][l].Im = 0.0
					}
					if (l === en) {
						/**
						 * 1-by-1 block isolated
						 */
						alfr[en] = a[en][en].Re
						alfi[en] = a[en][en].Im
						beta[en] = b11
						en = na
						goto60 = 1
						break // go to 60
					}
					/**
					 * check for small top of b
					 */
					l1 = l + 1
					if (b11 > epsb) break
					b[l][l].Re = 0.0
					s = a[l][l].cabs() + abs(a[l1][l].Re)
					u1 = a[l][l].Re / s
					u1i = a[l][l].Im / s
					u2 = a[l1][l].Re / s
					r = sqrt(u1 * u1 + u1i * u1i + u2 * u2)
					u1 /= r
					u1i /= r
					u2 /= r
					a[l][l].Re = R * S
					a[l][l].Im = 0.0
					for (j = l1; j <= enorn; j++) {
						xr = a[l][j].Re
						xi = a[l][j].Im
						yr = a[l1][j].Re
						yi = a[l1][j].Im
						a[l][j].Re = u1 * xr + u1i * xi + u2 * yr
						a[l][j].Im = u1 * xi - u1i * xr + u2 * yi
						a[l1][j].Re = u1 * yr - u1i * yi - u2 * xr
						a[l1][j].Im = u1 * yi + u1i * yr - u2 * xi
						xr = b[l][j].Re
						xi = b[l][j].Im
						yr = b[l1][j].Re
						yi = b[l1][j].Im
						b[l1][j].Re = u1 * yr - u1i * yi - u2 * xr
						b[l][j].Re = u1 * xr + u1i * xi + u2 * yr
						b[l][j].Im = u1 * xi - u1i * xr + u2 * yi
						b[l1][j].Im = u1 * yi + u1i * yr - u2 * xi
					}
					lm1 = l
					l = l1
					// go to 90 ...
				} while (1)
				// end 90
				if (goto60) break
				/**
				 * iteration strategy:
				 */
				if (its === 50) {
					/**
					 * set error subdiagonal
					 * element has not 
					 * Become negligible 
					 * after 50 iterations ...
					 */
					ierr = en
					/**
					 * save epsb for use by
					 * qzvec ...
					 */
					if (n - 1 > 0) b[n - 1][0] = epsb
					return outqzval()
				}
				if (its !== 10) {
					b33 = b[na][na].Re
					b33i = b[na][na].Im
					if (b[na][na].abs() < epsb) {
						b33 = epsb
						b33i = 0.0
					}
					b44 = b[en][en].Re
					b44i = b[en][en].Im
					if (b[en][en].abs() < epsb) {
						b44 = epsb
						b44i = 0.0
					}
					b3344 = b33 * b44 - b33i * b44i
					b3344i = b33 * b44i + b33i * b44
					a33 = a[na][na].Re * b44 - a[na][na].Im * b44i

					// ~ 124 ...
				} else {
					/**
					 * ad hoc shift
					 */
					sh = a[en][na].Re + a[na][enm2].Re
					shi = 0.0
				}
			} while (1)
			// end 70
			if (goto60) continue
			else break
		} while (1)
		// end 60.
	}
	return cqzhes(a, b, wantz)
}
/** */
euriklis.Mathematics.complexMatrix.prototype.eigenProblemLZ = function (B, wantx) {
	'use strict';
	/**
	 * This function solves the general eigenproblem Ax = λBx.
	 * The code is implementation of the fortran LZ Algorithm (Algorithn 496)
	 * published from Linda Kaufman (Copyright 15 April 1975, Association for Computing Machinery, Inc. 
	 * Department of Computer Science, University of Colorado, Boulder, CO 80302.
	 * ACM Transactions on Mathematmal Software, Vol. 1, No. 3, September 1975, Pages 271-281).  
	 */
	let a = this.z, b = new euriklis.Mathematics.complexMatrix(B).z;
	function lzhes(a, b, wantx) {
		/**
		 * @function lzhes : reduce the a to 
		 * upper Hessemberg matrix and b to 
		 * upper triangular matrix. If eigenvectors 
		 * are required from the user, returns
		 * an array x that have to be used from
		 * the next routine for computing the 
		 * eigenvectors.
		 * @param a : an n by n complex matrix
		 * @param b : an n by n complex matrix
		 * @param wantx : logical variable that 
		 * showws if eigenvectors are required
		 * from the user
		 */
		/**
		 * see THE LZ-ALGORITHM TO SOLVE THE 
		 * GENERALIZED EIGENVALUE PROBLEM of Linda Kaufman,
		 * SIAM J. NOMER. ANAL.
		 * Vol. 11, No. 5, October 1974, p.1001, §2.1
		 * and the FORTRAN code of the autor (Algorithm 496 or toms lz) ...
		 */
		/**
		 * Transformation of b to triangular matrix
		 * using elementary transformations. 
		 * Description: For each column i, find the
		 * largest subdiagonal element. If this element
		 * is smaller than the diagonal one, interchange
		 * the diagonal row i with the row of the biggest
		 * element. Make Gausian elimination with b(i,i)
		 */
		const complex = euriklis.Mathematics.complex
		let i, j, k, ii, c, d, w, x, y, z,
			n = a.length
		for (i = 0; i < n - 1; i++) {
			// d is the element with
			// maximal absolute value
			// and ii is the index of 
			// this element in column i ... 
			d = 0.0;
			for (k = i + 1; k < n; k++) {
				y = b[k][i];
				c = y.cabs();
				if (c <= d) continue;
				d = c;
				ii = k;
			}
			if (d === 0) continue;
			// get the diagonal element of i
			// column, if is with smaller 
			// norm than d then 
			// interchange the rows ...
			y = b[i][i]
			if (d > y.cabs()) {
				y = a[i];
				a[i] = a[ii];
				a[ii] = y;
				for (j = i; j < n; j++) {
					y = b[i][j];
					b[i][j] = b[ii][j];
					b[ii][j] = y;
				}
			}
			// Gausian elimination
			// (lead element b[i][i])
			for (j = i + 1; j < n; j++) {
				y = b[j][i].divide(b[i][i]);
				if (y.Re === 0 && y.Im === 0) {
					continue;
				}
				// set a(j,:) = a(j,:) - y*a(i,:)
				for (k = 0; k < n; k++) {
					a[j][k] = a[j][k].minus(y.times(a[i][k]))
				}
				for (k = i + 1; k < n; k++) {
					b[j][k] = b[j][k].minus(y.times(b[i][k]))
				}
			}
			b[i + 1][i] = new complex(0, 0)
		}
		/**
		 * initialize x (the eigenvector natrix)
		 */
		if (wantx) {
			x = [];
			for (i = 0; i < n; i++) {
				x[i] = [];
				for (j = 0; j < n; j++) x[i][j] = new complex(0, 0)
				x[i][i] = new complex(1, 0)
			}
		}
		if (n - 2 < 1) return {
			a: a,
			b: b,
			x: x
		}
		// reduce a to upper hessenberg 
		// keeping b upper triangular ...
		for (j = 0; j < n - 2; j++) {
			for (ii = 0; ii < n - 2 - j; ii++) {
				i = n - 1 - ii;
				w = a[i][j];
				z = a[i - 1][j];
				if (w.cabs() > z.cabs()) {
					// interchange rows:
					for (k = j; k < n; k++) {
						y = a[i][k];
						a[i][k] = a[i - 1][k];
						a[i - 1][k] = y;
					}
					for (k = i - 1; k < n; k++) {
						y = b[i][k];
						b[i][k] = b[i - 1][k];
						b[i - 1][k] = y;
					}
				}
				z = a[i][j];
				if (z.Re !== 0 || z.Im !== 0) {
					y = z.divide(a[i - 1][j]);
					for (k = j + 1; k < n; k++) {
						a[i][k] = a[i][k].minus(y.times(a[i - 1][k]))
					}
					for (k = i - 1; k < n; k++) {
						b[i][k] = b[i][k].minus(y.times(b[i - 1][k]))
					}
				}
				w = b[i][i - 1];
				z = b[i][i];
				if (w.cabs() > z.cabs()) {
					// interchange columns ...
					for (k = 0; k <= i; k++) {
						y = b[k][i];
						b[k][i] = b[k][i - 1];
						b[k][i - 1] = y;
					}
					for (k = 0; k < n; k++) {
						y = a[k][i];
						a[k][i] = a[k][i - 1];
						a[k][i - 1] = y;
					}
					if (wantx) {
						for (k = i - j - 1; k < n; k++) {
							y = x[k][i];
							x[k][i] = x[k][i - 1];
							x[k][i - 1] = y;
						}
					}
				}
				z = b[i][i - 1];
				if (z.Re === 0 && z.Im === 0) continue;
				y = z.divide(b[i][i]);
				for (k = 0; k <= i - 1; k++) {
					b[k][i - 1] = b[k][i - 1].minus(y.times(b[k][i]));
				}
				b[i][i - 1] = new complex(0, 0);
				for (k = 0; k < n; k++) {
					a[k][i - 1] = a[k][i - 1].minus(y.times(a[k][i]));
				}
				if (!wantx) continue;
				for (k = i - j - 1; k < n; k++) {
					x[k][i - 1] = x[k][i - 1].minus(y.times(x[k][i]));
				}
			}
			a[j + 2][j] = new complex(0, 0);
		}
		return {
			a: a,
			b: b,
			x: wantx ? x : false
		}
	}
	function lzit(a, b, x) {
		/**
		 * Initialization:
		 */
		const cmplx = euriklis.Mathematics.complex,
			out = () => {
				return {
					a: a,
					b: b,
					x: x,
					eiga: eiga,
					eigb: eigb,
					iter: iter
				}
			}
		/**
		 * the cabs prototype is
		 * declared above and is
		 * equals to |Re(a)| + |Im(a)|,
		 * where 'a' is a complex
		 * number and Re and Im
		 * are the real and imaginary
		 * parts of the 'a' ... 
		 */
		let wantx
		if (!x || typeof x === "undefined") wantx = false;
		else wantx = true;
		let n = a.length, eiga = new Array(n),
			eigb = new Array(n), s, w, y, z, lor0,
			iter = new Array(n), annm1, alfm, betm,
			d, sl, den, num, anm1m1, epsa, epsb, np1,
			ss, r, anorm, bnorm, ani, bni, c, d0, mb,
			d1, d2, e0, e1, nn = n - 1, i, j, m, nm1,
			its, lb, l, nl, nnorn, k, l1
		/**
	     * compute the machine precision
	     * times the norm of a and b ...
	     */
		nn = n - 1, anorm = 0.0, bnorm = 0
		for (i = 0; i < n; i++) {
			ani = 0.0
			if (i !== 0) {
				y = a[i][i - 1]
				ani += y.cabs()
			}
			bni = 0.0
			for (j = i; j < n; j++) {
				ani += a[i][j].cabs()
				bni += b[i][j].cabs()
			}
			if (ani > anorm) anorm = ani
			if (bni > bnorm) bnorm = bni
		}
		if (anorm === 0) anorm = 1.0
		if (bnorm === 0) bnorm = 1.0
		epsb = bnorm
		epsa = anorm
		do {
			epsa *= 0.5
			epsb *= 0.5
			c = anorm + epsa
		} while (c > anorm)
		if (n === 1) {
			eiga[nn] = a[nn][nn]
			eigb[nn] = b[nn][nn]
		} else {
			while (nn >= 0) {
				its = 0
				nm1 = nn - 1
				/**
				 * check for negligible 
				 * subdiagonal elements
				 */
				do {
					d2 = a[nn][nn].cabs()
					for (lb = 1; lb <= nn; lb++) {
						l = nn + 1 - lb
						ss = d2
						y = a[l - 1][l - 1]
						d2 = y.cabs()
						ss += d2
						y = a[l][l - 1]
						r = ss + y.cabs()
						if (r === ss) break;
					}
					if (r !== ss) l = 0
					if (l === nn) break
					if (its >= 30) {
						iter[nn] = -1
						if (a[nn][nm1].cabs() > 0.8 * annm1.cabs()) return out()
					}
					if (its === 10 || its === 20) {
						/**
						 * ad-hoc shift
						 */
						y = a[nm1][nn - 2]
						num = new cmplx(a[nn][nm1].cabs(), y.cabs())
						den = new cmplx(1)
					} else {
						annm1 = a[nn][nm1]
						anm1m1 = a[nm1][nm1]
						s = a[nn][nn].times(b[nm1][nm1]).minus(annm1.times(b[nm1][nn]))
						w = annm1.times(b[nn][nn])
							.times(a[nm1][nn]
								.times(b[nm1][nm1])
								.minus(b[nm1][nn]
									.times(anm1m1)))
						y = anm1m1.times(b[nn][nn]).minus(s).times(0.5)
						z = y.times(y).plus(w).power(0.5)
						if (z.Re !== 0.0 || z.Im !== 0.0) {
							d0 = y.divide(z).Re
							if (d0 < 0) z = z.times(-1)
						}
						den = y.plus(z).times(b[nm1][nm1].times(b[nn][nn]))
						if (den.Re === 0.0 && den.Im === 0.0) den = new cmplx(epsa)
						num = y.plus(z).times(s).minus(w)
					}
					/**
					 * check for 2 consecutive
					 * small subdiagonal elements ...
					 */
					if (nn !== l + 1) {
						d2 = a[nm1][nm1].cabs()
						e1 = annm1.cabs()
						d1 = a[nn][nn].cabs()
						nl = nn - l - 2
						for (mb = 0; mb <= nl; mb++) {
							m = nn - mb - 1
							e0 = e1
							y = a[m][m - 1]
							e1 = y.cabs()
							d0 = d1
							d1 = d2
							y = a[m - 1][m - 1]
							d2 = y.cabs()
							y = a[m][m].times(den).minus(b[m][m].times(num))
							d0 = (d0 + d1 + d2) * y.cabs()
							e0 = e0 * e1 * den.cabs() + d0
							if (e0 === d0) break
						}
					}
					if (e0 !== d0) m = l
					++its
					w = a[m][m].times(den).minus(b[m][m].times(num))
					z = a[m + 1][m].times(den)
					d1 = z.cabs()
					d2 = w.cabs()
					/**
					 * find L and M and
					 * set A = LAM and B = LBM
					 */
					np1 = n + 1
					lor0 = l
					nnorn = nn
					if (wantx) {
						lor0 = 0
						nnorn = n - 1
					}
					for (i = m; i <= nm1; i++) {
						j = i + 1
						/**
						 * find row transformations
						 * to restore A to upper 
						 * Hessenberg form. Apply 
						 * transformations to A and B
						 */
						if (i !== m) {
							w = a[i][i - 1]
							z = a[j][i - 1]
							d1 = z.cabs()
							d2 = w.cabs()
							if (d1 === 0.0) break
						}
						if (d2 <= d1) {
							/**
							 * must interchnge rows ...
							 */
							for (k = i; k <= nnorn; k++) {
								y = a[i][k]
								a[i][k] = a[j][k]
								a[j][k] = y
								y = b[i][k]
								b[i][k] = b[j][k]
								b[j][k] = y
							}
							if (i > m) a[i][i - 1] = a[j][i - 1]
							/**
							 * the scaling of w and z is designed to
							 * avoid A division by zero when the denominator is small
							 */
							if (d2 !== 0.0) y = new cmplx(w.Re / d1, w.Im / d1).divide(new cmplx(z.Re / d1, z.Im / d1))
						} else {
							y = new cmplx(z.Re / d2, z.Im / d2).divide(new cmplx(w.Re / d2, w.Im / d2))
						}
						if (d2 !== 0.0) {
							for (k = i; k <= nnorn; k++) {
								a[j][k] = a[j][k].minus(y.times(a[i][k]))
								b[j][k] = b[j][k].minus(y.times(b[i][k]))
							}
						}
						if (i > m) a[j][i - 1] = new cmplx(0)
						/**
						 * perform transformations from
						 * right to restore B to triangular
						 * form. Apply transformations to A
						 */
						z = b[j][i]
						w = b[j][j]
						d2 = w.cabs()
						d1 = z.cabs()
						if (d1 === 0.0) break
						if (d2 <= d1) {
							for (k = lor0; k <= j; k++) {
								y = a[k][j]
								a[k][j] = a[k][i]
								a[k][i] = y
								y = b[k][j]
								b[k][j] = b[k][i]
								b[k][i] = y
							}
							if (i !== nm1) {
								y = a[j + 1][j]
								a[j + 1][j] = a[j + 1][i]
								a[j + 1][i] = y
							}
							if (wantx) {
								for (k = 0; k < n; k++) {
									y = x[k][j]
									x[k][j] = x[k][i]
									x[k][i] = y
								}
							}
							if (d2 === 0.0) continue
							z = new cmplx(w.Re / d1, w.Im / d1).divide(new cmplx(z.Re / d1, z.Im / d1))
						} else z = new cmplx(z.Re / d2, z.Im / d2).divide(new cmplx(w.Re / d2, w.Im / d2))
						for (k = lor0; k <= j; k++) {
							a[k][i] = a[k][i].minus(z.times(a[k][j]))
							b[k][i] = b[k][i].minus(z.times(b[k][j]))
						}
						b[j][i] = new cmplx(0)
						if (i < nm1) a[i + 2][i] = a[i + 2][i].minus(z.times(a[i + 2][j]))
						if (wantx) {
							for (k = 0; k < n; k++) {
								x[k][i] = x[k][i].minus(z.times(x[k][j]))
							}
						}
					}
				} while (1)
				do {
					eiga[nn] = a[nn][nn]
					eigb[nn] = b[nn][nn]
					if (nn === 0) break
					iter[nn] = its
					nn = nm1
					if (nn > 0) break
					iter[0] = 0
				} while (1)
				if (nn === 0) break
			}
		}
		/**
		 * find eigenvectors using 
		 * b for imidiate storage ...
		 */
		if (!wantx) return out()
		m = n - 1
		do {
			alfm = a[m][m]
			betm = b[m][m]
			b[m][m] = new cmplx(1)
			l = m - 1
			while (l >= 0) {
				l1 = l + 1
				sl = new cmplx(0)
				for (j = l1; j <= m; j++) {
					sl = sl.plus(
						betm.times(a[l][j])
							.minus(alfm.times(b[l][j]))
							.times(b[j][m])
					)
				}
				y = betm.times(a[l][l])
					.minus(alfm
						.times(b[l][l]))
				if (y.Re === 0.0 && y.Im === 0.0) y = new cmplx(0.5 * (epsa + epsb))
				b[l][m] = sl.divide(y).times(-1)
				l -= 1
			}
			m -= 1
		} while (m >= 0)
		/**
		 * transform to the 
		 * original coordinate system
		 */
		m = n - 1
		while (m >= 0) {
			for (i = 0; i < n; i++) {
				s = new cmplx(0)
				for (j = 0; j <= m; j++) {
					s = s.plus(x[i][j].times(b[j][m]))
				}
				x[i][m] = s
			}
			m -= 1
		}
		m = n - 1
		while (m >= 0) {
			ss = 0.0
			for (i = 0; i < n; i++) {
				r = x[i][m].cabs()
				if (r < ss) continue
				ss = r
				d = x[i][m]
			}
			if (ss !== 0) {
				for (i = 0; i < n; i++) x[i][m] = x[i][m].divide(d)
			}
			m -= 1
		}
		return out()
	}
	let o = lzhes(a, b, wantx)
	return lzit(o.a, o.b, o.x)
}
euriklis.Mathematics.polynomial = function (unknown, equation) {
	this.unknown = unknown;
	this.equation = equation;
}
euriklis.Mathematics.polynomial.prototype.toMonomials = function toMonomials() {

	/************************************************************************************/
	function simplification(expression) {
		/*
		 *	Alg type for x oriented expressions...
		 */
		var Alg = function (a) {
			this.str = (typeof a === 'undefined') ? '' : a;
		}
		function pow_str(str) {
			var powfunc = "Math.pow", fpch = '(', spch = ')', str = euriklis.deepCopy(str), str1 = euriklis.deepCopy(str);
			var re = /(\w+)\^(\w+)/, hasPow = /\^/.test(str), powAreNum = str.split('^').every(elem => !isNaN(parseFloat(elem)));
			str = hasPow ? str.replace(re, '$1, $2') : str;
			str = hasPow && powAreNum ? eval(powfunc + fpch + str + spch) : str1;
			return str;
		}
		Alg.prototype.mul = function mul(b) {
			var a = this.str.toString(), b = b.toString();
			if ((!this.number && !this.char && !this.pows)) {
				var alg = new Alg(this.str), process = true,
					number = [], chi = [], pows = { base: [], pow: [] };
				euriklis.isNumber(a) ? number.push(a) :
					euriklis.charUtility.isChi(a) ? chi.push(a) :
						euriklis.charUtility.isPow(a) ? (pows.base.push(euriklis.charUtility.powParam(a)[0]), pows.pow.push(euriklis.charUtility.powParam(a)[1])) :
							process = false;
				euriklis.isNumber(b) ? number.push(b) :
					euriklis.charUtility.isChi(b) ? chi.push(b) :
						euriklis.charUtility.isPow(b) ? (pows.base.push(euriklis.charUtility.powParam(b)[0]), pows.pow.push(euriklis.charUtility.powParam(b)[1])) :
							process = false;
				if (process) {
					var prodNum = 1, prodChi = '', prodPow = '';
					for (var i = 0; i < number.length; i++) { prodNum *= number[i]; }
					if (chi.length === 1 && pows.base === []) { chi = chi; }
					if (chi.length === 1 && euriklis.charUtility.isChi(pows.base[0])) { pows.pow[0] = parseFloat(pows.pow[0]) + 1; chi = []; }
					if (chi.length === 2) { pows.base.push(chi); pows.pow.push(2); chi = []; }
					if (pows.base.length === 2 && pows.base[0] === pows.base[1]) {
						pows.pow = [parseFloat(pows.pow[0]) + parseFloat(pows.pow[1])];
						pows.base = [pows.base[0]];
					}
					if (pows.base.length === 1) { pows = pows; }
					prodChar = chi.join('');
					for (i = 0; i < pows.base.length; i++) { prodPow += String(pows.base[i]) + '\^' + pows.pow[i]; }
					alg.str = prodNum + prodChar + prodPow;
					alg.number = [prodNum];
					alg.chi = chi;
					alg.pows = pows;

				};
				return alg;
			} else {
				var number = [1], chi = [], pows = { base: [], pow: [] }, process = true, nothing = '';
				euriklis.isNumber(b) ? (number[0] = b) :
					euriklis.charUtility.isChi(b) ? (chi.push(b)) :
						euriklis.charUtility.isPow(b) ? ((pows.base.push(euriklis.charUtility.powParam(b)[0]), pows.pow.push(euriklis.charUtility.powParam(b)[1]))) :
							process = false;
				if (process) {
					if (number.length === 1) { this.number[0] *= number[0]; }
					if (chi.length === 1 && this.chi.length === 1) {
						this.pows.pow[0] = 2;
						this.pows.base[0] = 'x';
						this.chi = [];
						chi = [];
					}
					if (chi.length === 1 && this.pows.base.length === 1) {
						this.pows.pow[0] = parseFloat(this.pows.pow[0]) + 1;
						this.chi = [];
					}
					if (chi.length === 1 && this.chi.length === 0 && this.pows.base.length === 0) { this.chi[0] = chi[0]; }
					if (pows.base.length === 1 && this.pows.base.length === 1) {
						this.pows.pow[0] = parseFloat(this.pows.pow[0]) + parseFloat(pows.pow[0]);
					}
					if (pows.base.length === 1 && this.pows.base.length === 0) { this.pows = pows; }
					if (this.chi.length === 1 && pows.base.length === 1) {
						this.pows.pow[0] = parseFloat(pows.pow[0]) + 1;
						this.chi = [];
					}
					this.str = this.number.toString() + this.chi.toString() + ((isChi(this.pows.base[0])) ? (this.pows.base.toString() + '\^' + this.pows.pow.toString()) : nothing);
				}
				return this;
			}
		}
		Alg.prototype.dev = function dev(b) {
			var b = b.toString();
			if (euriklis.isNumber(b)) {
				b = 1 / parseFloat(b);
				return new Alg(this.str).mul(b);
			}
			if (euriklis.charUtility.isPow(b) && b !== 'x') { b = 'x^' + '-' + euriklis.charUtility.powParam(b)[1]; }
			if (euriklis.charUtility.isChi(b)) { b = 'x^-1'; }
			return this.mul(b);
		}
		var operatorMatching = function (sym) {
			var opr = (sym === '*') ? '.mul' :
				(sym === '/') ? '.dev' :
					sym;
			return opr;
		};

		var expression = euriklis.deepCopy(expression),
			isMathSymbol = function (k) {
				return /[\/\*]/.test(k);
			},
			isPartOfNumber = function (expr, k) {
				var result = (expr[k] === 'e' && (/[\+\-]/.test(expr[k + 1]) && /[0-9]/.test(expr[k + 2]))) || (/[\+\-]/.test(expr[k]) && expr[k - 1] === 'e') || (/[0-9\.]/.test(expr[k]));
				return result;
			};
		var spliting = function spliting(expression) {
			var i, char;
			if (typeof (expression) === 'string') {
				for (char = 0; char < 2 * expression.length; char++) {
					if (isMathSymbol(expression[char])) {
						expression = expression.insert(char, ' ');
						expression = expression.insert(char + 2, ' ');
						char += 2;
					}
				}
			}
			expression = expression.split(' ');
			return expression;
		};
		expression = spliting(expression);
		for (i = 0; i < expression.length; i++) {
			for (char = 0; char < expression[i].length; char++) {
				if (char !== 0 && !isPartOfNumber(expression[i], char) && !isMathSymbol(expression[i]) && /[a-df-z]/.test(expression[i][char])) {
					expression[i] = expression[i].insert(char, '\*');
					char += 1;
				}

			}

		}
		expression = expression.join('');
		expression = spliting(expression);
		for (var item = 0; item < expression.length; item++) {
			if (item === 0 && !euriklis.charUtility.hasPow(expression[item])) {
				expression[item] = 'new Alg(' + '"' + expression[item] + '"' + ')';
			}
			if (item === 0 && euriklis.charUtility.hasPow(expression[item])) {
				expression[item] = 'new Alg(pow_str(' + '"' + expression[item] + '")' + ')';
			}
			if (expression[item] === '*' || expression[item] === '/') {
				expression[item + 1] = '(' + '"' + expression[item + 1] + '"' + ')';
			}
			if (euriklis.charUtility.hasPow(expression[item]) && item !== 0) {
				expression[item] = '(pow_str' + expression[item] + ')';
			}
			expression[item] = operatorMatching(expression[item]);
		}

		expression = expression.join('');
		expression = eval(expression);
		return expression;

	}
	var i, eq = this.equation, x = this.unknown, eq = euriklis.deepCopy(eq),
		eq = eq.replace(/\s+/g, ''), eq = eq.replace(new RegExp(x, 'g'), 'x'),
		eqlen = eq.length;
	function pow_str(str) {
		var powfunc = "Math.pow", fpch = '(', spch = ')', str = euriklis.deepCopy(str), str1 = euriklis.deepCopy(str);
		var re = /(\w+)\^(\w+)/, hasPow = /\^/.test(str), powAreNum = str.split('^').every(elem => !isNaN(parseFloat(elem)));
		str = hasPow ? str.replace(re, '$1, $2') : str;
		str = hasPow && powAreNum ? eval(powfunc + fpch + str + spch) : str1;
		return str;
	}
	/*
	execute the parenthesis expressions:
	1. fpch --> first parenthesis character array,
	2. spch --> second parenthesis character array.
	*/
	function _toMonomials_(eq) {
		var i, fpch = euriklis.charUtility.termIndices('\(', eq), spch = euriklis.charUtility.termIndices('\)', eq), eqlen = eq.length;
		if (fpch.length !== spch.length) { euriklis.nrerror('Uncorrect use of parenthesis!'); }
		else {
			if (fpch.length == 0 && spch.length == 0) {
				for (i = 0; i < 2 * eqlen; i++) {
					if ((euriklis.charUtility.isPlus(eq.charAt(i)) && !euriklis.charUtility.isE(eq.charAt(i - 1))) ||
						(euriklis.charUtility.isMinus(eq.charAt(i)) && !euriklis.charUtility.isE(eq.charAt(i - 1)))) { eq = eq.insert(i, ' '); i += 1; }
				}
				return eq;
			}
			else {
				for (i = 0; i < fpch.length; i++) {
					if (fpch[i] > spch[i]) euriklis.nrerror('Uncorrect use of parenthesis!');
				}
				currentFParenthesis = Math.max.apply(null, fpch.filter(function (x) { return x >= 0 && x < spch[0]; }));
				currentSParenthesis = spch[0];
				currentExpression = eq.substring(currentFParenthesis, currentSParenthesis + 1);
				operationExpression = currentExpression.substring(1, currentExpression.length - 1);
				for (i = 0; i < 2 * operationExpression.length; i++) {
					if ((euriklis.charUtility.isPlus(operationExpression.charAt(i)) && !euriklis.charUtility.isE(operationExpression.charAt(i - 1))) ||
						(euriklis.charUtility.isMinus(operationExpression.charAt(i)) && !euriklis.charUtility.isE(operationExpression.charAt(i - 1)))) { operationExpression = operationExpression.insert(i, ' '); i += 1; }
					if (euriklis.charUtility.isStar(operationExpression.charAt(i)) || euriklis.charUtility.isDev(operationExpression.charAt(i))) {
						operationExpression = operationExpression.insert(i, ' ');
						operationExpression = operationExpression.insert(i + 2, ' ');
						i += 2;
					}
				}
				operationExpression = operationExpression.split(' ');
				for (i = 0; i < operationExpression.length; i++) {
					operationExpression[i] = pow_str(operationExpression[i]);
				}
				operationExpression = eval(operationExpression.join(''));
				eq = eq.replace(currentExpression, operationExpression);
				return _toMonomials_(eq);
			}

		}

	}
	eq = _toMonomials_(eq);
	eq = eq.split(' ');
	for (var ii = 0; ii < eq.length; ii++) {
		eq[ii] = simplification(eq[ii]);
		eq[ii] = eq[ii].str.replace(/x/g, x);
	}
	//eq = eq.replace(/x/g,x);
	//eq = eq.split(' ');
	return eq;
}
euriklis.Mathematics.polynomial.prototype.properties = function (propObj) {
	if ((typeof this.unknown === 'undefined' && typeof this.equation) && typeof propObj === 'undefined') {
		euriklis.nrerror('You hane not inserted correctly the input elements!');
	}
	if ((typeof this.unknown === 'undefined' && typeof this.equation) && propObj) {
		properties = propObj;
	}
	if ((this.unknown && typeof this.equation) && typeof propObj === 'undefined') {
		/*number declarations*/
		var i, j, k, xlen = this.unknown.length, eqlen = this.equation.length,
			/*string declarations*/
			x = this.unknown, eq = this.equation,
			/*Array declarations*/
			coefArr = new Array(), rankArr = new Array(), indices_x = euriklis.charUtility.termIndices(x, eq),
			/*logical declarations*/
			exist_x = indices_x.length === 0 ? false : true,
			/*deep cpoy of equation string and space removing*/
			neq = euriklis.deepCopy(eq), neq = neq.replace(/\s+/g, ''),
			eqarr = this.toMonomials(),
			/*function declarations*/
			errorCombinations = euriklis.charUtility.allCombinationsPerCouples(['+', '-', '*', '^', '.', '/']),/*'++',--, etc...*/
			existErrCombinations = function () {
				var exist_err_comb = false, err; for (err = 0; err < errorCombinations.length; err++) {
					if (euriklis.charUtility.termIndexes(errorCombinations[err], eq).length !== 0) { exist_err_comb = true; break; }
				}
				return { existErr: exist_err_comb, errorCombination: errorCombinations[err] };
			},
			properties = function () {
				var currentMonomial, c = [], p = [];
				for (i = 0; i < eqarr.length; i++) {
					var tempStar, tempDev, temp;
					currentMonomial = eqarr[i];
					tempStar = currentMonomial.split('*');
					tempDev = currentMonomial.split('/');
					if (tempStar == currentMonomial && tempDev == currentMonomial) {
						temp = currentMonomial.split(x);
						c.push(eval(temp[0] == '' ? 1 : temp[0]));
						p[i] = (typeof temp[1] != 'undefined') ? ((euriklis.charUtility.isPower(temp[1][0])) ? eval(temp[1].replace('^', '')) :
							temp[1] == '' ? 1 :
								euriklis.nrerror('Power error!!!')) : 0;
					}
					//if(tempStar!=)
				}
				return { coefficients: c, powers: p };
			},
			otherUnknown = function () {
				var i, result = false, nneq = neq.replace(new RegExp(x, 'g'), '');
				for (i = 0; i < nneq.length; i++) { if (euriklis.charUtility.isOtherChar(nneq.charAt(i))) { result = true; break; } }
				return result;
			};

		//check for errors:
		(existErrCombinations().existErr) ? euriklis.nrerror('Error combination ' + "'" + existErrCombinations().errorCombination + "'" + '!') :
			(!exist_x && otherUnknown()) ? euriklis.nrerror('Uncorrect declaration and more than one unknown in the polynomial!') :
				(!exist_x) ? euriklis.nrerror('The declaration of the unknnown is not correct!') :
					(otherUnknown()) ? euriklis.nrerror('Exist more than one unknowns in the polynomial!') :
						properties = properties();
	}
	return properties;
}
euriklis.Mathematics.polynomial.prototype.roots = function () {
	var prop = typeof (this.properties === 'undefined') ? this.simplifyParam() : this.properties;
	//rank of the polynomial:
	rank = Math.max.apply(null, prop.powers);
	//console.log('rank:'+rank);
	var rankIndex = prop.powers.indexOf(rank);
	(prop.coefficients && prop.powers) ?
		prop.coefficients[rankIndex] !== 1 ?
			prop.coefficients = new euriklis.Mathematics.Matrix([prop.coefficients]).times(1 / prop.coefficients[rankIndex]).M[0] :
			prop.coefficients = prop.coefficients :
		euriklis.nrerror('Absent the coefficients or the powers!');
	rootMatrix = euriklis.Mathematics.zero(rank).M;
	//console.log(rootMatrix);
	coeff = euriklis.Mathematics.cloning(prop.coefficients).M;
	//search for similar powers and adding:

	//coeff.reverse();
	for (var i = 1; i < rank; i++) { rootMatrix[i][i - 1] = 1; }
	for (var j = 0; j <= rank; j++) {
		if (prop.powers[j] < rank) {
			//console.log('pow'+prop.powers[j]);
			//console.log('coeff'+coeff[prop.powers.indexOf(prop.powers[j])]);
			rootMatrix[prop.powers[j]][rank - 1] = -coeff[prop.powers.indexOf(prop.powers[j])];
		}
	}
	//console.log(rootMatrix);
	//console.log(rootMatrix);
	rootMatrix = euriklis.Mathematics.cloning(rootMatrix);
	// console.log(rootMatrix);
	//
	var roots = rootMatrix.eigenvalue();
	return roots;
}
euriklis.Mathematics.polynomial.prototype.simplifyParam = function () {
	eqs = new euriklis.Mathematics.polynomial(this.unknown, this.equation).properties();
	var coefficients = [],
		polCoeff = eqs.coefficients,
		powers = euriklis.Mathematics.cloning(eqs.powers).mergeSort().sort.unique(),
		coeffGroup = euriklis.Mathematics.cloning(eqs.powers).mergeSort().coefficientsAssigment;
	for (var unc = 0; unc < coeffGroup.length; unc++) {
		coefficients[unc] = 0;
		for (var dupc = 0; dupc < coeffGroup[unc].length; dupc++) {
			coefficients[unc] += polCoeff[coeffGroup[unc][dupc]];
		}
	}
	eqs.powers = powers.reverse();
	eqs.coefficients = coefficients.reverse();
	correctionPow = Math.min.apply(null, eqs.powers);
	if (correctionPow < 0) {
		for (var i = 0; i < eqs.powers.length; i++) {
			eqs.powers[i] += Math.abs(correctionPow);
		}
	}
	return eqs;
}
euriklis.Mathematics.polynomial.prototype.simplify = function () {
	pol = this.simplifyParam();
	sumStr = '';
	for (var item = 0; item < pol.powers.length; item++) {
		(pol.powers[item] === 0) ? sumStr += (pol.coefficients[item] > 0 ? '+' : '') + pol.coefficients[item].toString() :
			(pol.powers[item] === 1) ? sumStr += (pol.coefficients[item] > 0 ? '+' : '') + pol.coefficients[item].toString() + this.unknown :
				sumStr += (pol.coefficients[item] > 0 && item !== 0 ? '+' : '') + pol.coefficients[item].toString() + this.unknown + '^' + pol.powers[item].toString();
	}
	return new euriklis.Mathematics.polynomial(this.unknown, sumStr);
}
euriklis.Mathematics.polynomial.prototype.solveAt = function (xVal) {
	var coefficients = this.simplifyParam().coefficients.reverse();
	return coefficients.reduceRight(function (acc, coeff) { return (acc * xVal + coeff) }, 0);
}
euriklis.Mathematics.SystemEquations = new Object();
euriklis.Mathematics.SystemEquations.linear = function linear(a, b) {
	// solve the X vector of the matrix equation 'AX = B'   
	var a = euriklis.Mathematics.cloning(a),
		n = a.rows,
		b = euriklis.Mathematics.cloning(b);
	if (b.rows === n) {
		if (a.isSquare() && a.rank() === n) {
			return a.addLastColumn(b).toReducedRowEchelonForm().getColumn(n);
		}
		else {
			if (a.isSquare() && a.rank() < n) {
				euriklis.nrerror('The coefficient matrix has rank lower than ' + n + '!');
			} else euriklis.nrerror('The coefficient matrix is not sqare!');
		}
	} else euriklis.nrerror('Uncorrect input of b vector!');
}
euriklis.Mathematics.SystemEquations.Vandermonde = function Vandermonde(x, q) {
	var x = euriklis.Mathematics.cloning(x).M,
		q = euriklis.Mathematics.cloning(q).M,
		i, j, k, n = x.length,
		w = new Array(n), b, s, t,
		xx, c = new Array(n);
	if (n == 1) w[1 - 1] = q[1 - 1];
	else {
		for (i = 1; i <= n; i++) c[i - 1] = 0.0;
		c[n - 1] = -x[1 - 1];
		for (i = 2; i <= n; i++) {
			xx = -x[i - 1];
			for (j = (n + 1 - i); j <= (n - 1); j++) c[j - 1] += xx * c[j];
			c[n - 1] += xx;
		}
		for (i = 1; i <= n; i++) {
			xx = x[i - 1];
			t = b = 1.0;
			s = q[n - 1];
			for (k = n; k >= 2; k--) {
				b = c[k - 1] + xx * b;
				s += q[k - 2] * b;
				t = xx * t + b;
			}
			w[i - 1] = s / t;
		}
	}
	delete c;
	return w.toMatrix();
}
euriklis.Mathematics.SystemEquations.Toeplitz = function Toeplitz(y, r) {
	var y = euriklis.Mathematics.cloning(y).M,
		r = euriklis.Mathematics.cloning(r).M,
		j, k, m, m1, m2, n = y.length,
		pp, pt1, pt2, qq, qt1, qt2, sd, sgd, sgn, shn, sxn,
		g = new Array(), h = new Array(), x = new Array();
	if (r[n - 1] == 0.0) euriklis.nrerror("Toeplitz - 1 singular principal minor");
	x[1 - 1] = y[1 - 1] / r[n - 1];
	if (n == 1) return x.toMatrix();
	g[1 - 1] = r[n - 2] / r[n - 1];
	h[1 - 1] = r[n + 2] / r[n - 1];
	for (m = 1; m <= n; m++) {
		m1 = m + 1;
		sxn = -y[m1 - 1];
		sd = -r[n - 1];
		for (j = 1; j <= m; j++) {
			sxn += r[n + m1 - j - 1] * x[j - 1];
			sd += r[n + m1 - j - 1] * g[m - j];
		}
		if (sd == 0.0) euriklis.nrerror("Toeplitz - 2 singular principal minor");
		x[m1 - 1] = sxn / sd;
		for (j = 1; j <= m; j++) x[j - 1] -= x[m1 - 1] * g[m - j];
		if (m1 == n) return x.toMatrix();
		sgn = -r[n - m1 - 1];
		shn = -r[n + m1 - 1];
		sgd = -r[n - 1];
		for (j = 1; j <= m; j++) {
			sgn += r[n + j - m1 - 1] * g[j - 1];
			shn += r[n + m1 - j - 1] * h[j - 1];
			sgd += r[n + j - m1 - 1] * h[m - j];
		}
		if (sgd == 0.0) euriklis.nrerror("Toeplitz - 3 singular principal minor");
		g[m1 - 1] = sgn / sgd;
		h[m1 - 1] = shn / sd;
		k = m;
		m2 = (m + 1) >> 1;
		pp = g[m1 - 1];
		qq = h[m1 - 1];
		for (j = 1; j <= m2; j++) {
			pt1 = g[j - 1];
			pt2 = g[k - 1];
			qt1 = h[j - 1];
			qt2 = h[k - 1];
			g[j - 1] = pt1 - pp * qt2;
			g[k - 1] = pt2 - pp * qt1;
			h[j - 1] = qt1 - qq * pt2;
			var newk = k - 1;
			h[newk--] = qt2 - qq * pt1;
		}
	}
	euriklis.nrerror("Toeplitz - internal error!");
}
euriklis.Mathematics.derivateAt = function (fn, x, h) {
	/*
	This code estimate the derivate of an function fn
	by Ridder's method.
	*/
	var CON = 1.4, CON2 = (CON * CON),
		BIG = 1.0e+30, NTAB = 10, i, j,
		SAFE = 2.0, errt, fac = 1, hh, a, ans;
	if (h === 0.0) euriklis.nrerror("h must be nonzero in ridder's method!");
	a = euriklis.Mathematics.createMatrix(NTAB, NTAB).M;
	hh = h;
	a[0][0] = (fn(x + hh) - fn(x - hh)) / (2.0 * hh);
	err = BIG;
	for (i = 1; i < NTAB; i++) {
		hh /= CON;
		a[0][i] = (fn(x + hh) - fn(x - hh)) / (2.0 * hh);
		for (j = 1; j < i; j++) {
			a[j][i] = (a[j - 1][i] * fac - a[j - 1][i - 1]) / (fac - 1.0);
			fac = CON2 * fac;
			errt = Math.max(Math.abs(a[j][i] - a[j - 1][i]), Math.abs(a[j][i] - a[j - 1][i - 1]));
			if (errt <= err) {
				err = errt;
				ans = a[j][i];
			}
		}
		if (Math.abs(a[i][i] - a[i - 1][i - 1]) >= SAFE * (err)) break;
	}
	return ans;
}
euriklis.Mathematics.gradient = function gradient(f, x) {
	var n = x.length;
	var f0 = f(x);
	if (isNaN(f0)) throw new Error('gradient: f(x) is a NaN!');
	var max = Math.max;
	var i, x0 = euriklis.Mathematics.cloning(x).M, f1, f2, J = Array(n);
	var errest, roundoff, max = Math.max, eps = 1e-3, abs = Math.abs, min = Math.min;
	var t0, t1, t2, it = 0, d1, d2, N;
	for (i = 0; i < n; i++) {
		var h = max(1e-6 * f0, 1e-8);
		while (1) {
			++it;
			if (it > 20) { throw new Error("Numerical gradient fails"); }
			x0[i] = x[i] + h;
			f1 = f(x0);
			x0[i] = x[i] - h;
			f2 = f(x0);
			x0[i] = x[i];
			if (isNaN(f1) || isNaN(f2)) { h /= 16; continue; }
			J[i] = (f1 - f2) / (2 * h);
			t0 = x[i] - h;
			t1 = x[i];
			t2 = x[i] + h;
			d1 = (f1 - f0) / h;
			d2 = (f0 - f2) / h;
			N = max(abs(J[i]), abs(f0), abs(f1), abs(f2), abs(t0), abs(t1), abs(t2), 1e-8);
			errest = min(max(abs(d1 - J[i]), abs(d2 - J[i]), abs(d1 - d2)) / N, h / N);
			if (errest > eps) { h /= 16; }
			else break;
		}
	}
	return J;
}
euriklis.Mathematics.Hessian = (f, x) => {
	'use strict';
	const cpx = x.toMatrix(),
		n = (cpx.rows === 1 || cpx.rows === 0) && cpx.columns ? cpx.columns :
			cpx.rows !== 1 && cpx.columns === 1 ? (cpx.rows, cpx.transpose().M[0].toMatrix()) :
				euriklis.nrerror('Euriklis Hessian error : Incorrect insided initial vector x!!!');
	let i, gradient = euriklis.Mathematics.gradient, h = new Array(n), x_init,
		fx = (x) => {
			return gradient(f, x)[i];
		};
	x_init = cpx.M[0].constructor === Array ? cpx.M[0] : cpx.M;
	for (i = 0; i < n; i++) h[i] = gradient(fx, x_init);
	return h.toMatrix();
}
euriklis.Mathematics.Jacobian = (F, x) => {
	'use strict';
	const n = F.constructor === Array && F.every(element => element.constructor === Function) ?
		F.length : euriklis.nrerror('Euriklis Jacobian : the functions have to be inserted in an 1 x n dimensional Array!!!'),
		cpx = x.toMatrix(),
		nargs = (cpx.rows === 1 || cpx.rows === 0) && cpx.columns ? cpx.columns :
			cpx.rows !== 1 && cpx.columns === 1 ? (cpx.rows, cpx.transpose()) :
				euriklis.nrerror('Euriklis Jacobian : the arguments are incorrectly inserted!!!');
	let i, gradient = euriklis.Mathematics.gradient, J = new Array(n), x_init;
	x_init = cpx.M[0].constructor === Array ? cpx.M[0] : cpx.M;
	if (x_init.some(element => isNaN(element))) euriklis.nrerror('Some values of x scalar are not numbers!!!');
	for (i = 0; i < n; i++) J[i] = gradient(F[i], x_init);
	return J.toMatrix();
}
euriklis.Mathematics.programming = new Object();
(function (exports) {

	function base0to1(A) {
		if (typeof A !== "object") { return A; }
		var ret = [], i, n = A.length;
		for (i = 0; i < n; i++) ret[i + 1] = base0to1(A[i]);
		return ret;
	}
	function base1to0(A) {
		if (typeof A !== "object") { return A; }
		var ret = [], i, n = A.length;
		for (i = 1; i < n; i++) ret[i - 1] = base1to0(A[i]);
		return ret;
	}

	function dpori(a, lda, n) {
		var i, j, k, kp1, t;

		for (k = 1; k <= n; k = k + 1) {
			a[k][k] = 1 / a[k][k];
			t = -a[k][k];
			//~ dscal(k - 1, t, a[1][k], 1);
			for (i = 1; i < k; i = i + 1) {
				a[i][k] = t * a[i][k];
			}

			kp1 = k + 1;
			if (n < kp1) {
				break;
			}
			for (j = kp1; j <= n; j = j + 1) {
				t = a[k][j];
				a[k][j] = 0;
				//~ daxpy(k, t, a[1][k], 1, a[1][j], 1);
				for (i = 1; i <= k; i = i + 1) {
					a[i][j] = a[i][j] + (t * a[i][k]);
				}
			}
		}

	}

	function dposl(a, lda, n, b) {
		var i, k, kb, t;

		for (k = 1; k <= n; k = k + 1) {
			//~ t = ddot(k - 1, a[1][k], 1, b[1], 1);
			t = 0;
			for (i = 1; i < k; i = i + 1) {
				t = t + (a[i][k] * b[i]);
			}

			b[k] = (b[k] - t) / a[k][k];
		}

		for (kb = 1; kb <= n; kb = kb + 1) {
			k = n + 1 - kb;
			b[k] = b[k] / a[k][k];
			t = -b[k];
			//~ daxpy(k - 1, t, a[1][k], 1, b[1], 1);
			for (i = 1; i < k; i = i + 1) {
				b[i] = b[i] + (t * a[i][k]);
			}
		}
	}

	function dpofa(a, lda, n, info) {
		var i, j, jm1, k, t, s;

		for (j = 1; j <= n; j = j + 1) {
			info[1] = j;
			s = 0;
			jm1 = j - 1;
			if (jm1 < 1) {
				s = a[j][j] - s;
				if (s <= 0) {
					break;
				}
				a[j][j] = Math.sqrt(s);
			} else {
				for (k = 1; k <= jm1; k = k + 1) {
					//~ t = a[k][j] - ddot(k - 1, a[1][k], 1, a[1][j], 1);
					t = a[k][j];
					for (i = 1; i < k; i = i + 1) {
						t = t - (a[i][j] * a[i][k]);
					}
					t = t / a[k][k];
					a[k][j] = t;
					s = s + t * t;
				}
				s = a[j][j] - s;
				if (s <= 0) {
					break;
				}
				a[j][j] = Math.sqrt(s);
			}
			info[1] = 0;
		}
	}

	function qpgen2(dmat, dvec, fddmat, n, sol, crval, amat,
		bvec, fdamat, q, meq, iact, nact, iter, work, ierr) {

		var i, j, l, l1, info, it1, iwzv, iwrv, iwrm, iwsv, iwuv, nvl, r, iwnbv,
			temp, sum, t1, tt, gc, gs, nu,
			t1inf, t2min,
			vsmall, tmpa, tmpb,
			go;

		r = Math.min(n, q);
		l = 2 * n + (r * (r + 5)) / 2 + 2 * q + 1;

		vsmall = 1.0e-60;
		do {
			vsmall = vsmall + vsmall;
			tmpa = 1 + 0.1 * vsmall;
			tmpb = 1 + 0.2 * vsmall;
		} while (tmpa <= 1 || tmpb <= 1);

		for (i = 1; i <= n; i = i + 1) {
			work[i] = dvec[i];
		}
		for (i = n + 1; i <= l; i = i + 1) {
			work[i] = 0;
		}
		for (i = 1; i <= q; i = i + 1) {
			iact[i] = 0;
		}

		info = [];

		if (ierr[1] === 0) {
			dpofa(dmat, fddmat, n, info);
			if (info[1] !== 0) {
				ierr[1] = 2;
				return;
			}
			dposl(dmat, fddmat, n, dvec);
			dpori(dmat, fddmat, n);
		} else {
			for (j = 1; j <= n; j = j + 1) {
				sol[j] = 0;
				for (i = 1; i <= j; i = i + 1) {
					sol[j] = sol[j] + dmat[i][j] * dvec[i];
				}
			}
			for (j = 1; j <= n; j = j + 1) {
				dvec[j] = 0;
				for (i = j; i <= n; i = i + 1) {
					dvec[j] = dvec[j] + dmat[j][i] * sol[i];
				}
			}
		}

		crval[1] = 0;
		for (j = 1; j <= n; j = j + 1) {
			sol[j] = dvec[j];
			crval[1] = crval[1] + work[j] * sol[j];
			work[j] = 0;
			for (i = j + 1; i <= n; i = i + 1) {
				dmat[i][j] = 0;
			}
		}
		crval[1] = -crval[1] / 2;
		ierr[1] = 0;

		iwzv = n;
		iwrv = iwzv + n;
		iwuv = iwrv + r;
		iwrm = iwuv + r + 1;
		iwsv = iwrm + (r * (r + 1)) / 2;
		iwnbv = iwsv + q;

		for (i = 1; i <= q; i = i + 1) {
			sum = 0;
			for (j = 1; j <= n; j = j + 1) {
				sum = sum + amat[j][i] * amat[j][i];
			}
			work[iwnbv + i] = Math.sqrt(sum);
		}
		nact = 0;
		iter[1] = 0;
		iter[2] = 0;

		function fn_goto_50() {
			iter[1] = iter[1] + 1;

			l = iwsv;
			for (i = 1; i <= q; i = i + 1) {
				l = l + 1;
				sum = -bvec[i];
				for (j = 1; j <= n; j = j + 1) {
					sum = sum + amat[j][i] * sol[j];
				}
				if (Math.abs(sum) < vsmall) {
					sum = 0;
				}
				if (i > meq) {
					work[l] = sum;
				} else {
					work[l] = -Math.abs(sum);
					if (sum > 0) {
						for (j = 1; j <= n; j = j + 1) {
							amat[j][i] = -amat[j][i];
						}
						bvec[i] = -bvec[i];
					}
				}
			}

			for (i = 1; i <= nact; i = i + 1) {
				work[iwsv + iact[i]] = 0;
			}

			nvl = 0;
			temp = 0;
			for (i = 1; i <= q; i = i + 1) {
				if (work[iwsv + i] < temp * work[iwnbv + i]) {
					nvl = i;
					temp = work[iwsv + i] / work[iwnbv + i];
				}
			}
			if (nvl === 0) {
				return 999;
			}

			return 0;
		}

		function fn_goto_55() {
			for (i = 1; i <= n; i = i + 1) {
				sum = 0;
				for (j = 1; j <= n; j = j + 1) {
					sum = sum + dmat[j][i] * amat[j][nvl];
				}
				work[i] = sum;
			}

			l1 = iwzv;
			for (i = 1; i <= n; i = i + 1) {
				work[l1 + i] = 0;
			}
			for (j = nact + 1; j <= n; j = j + 1) {
				for (i = 1; i <= n; i = i + 1) {
					work[l1 + i] = work[l1 + i] + dmat[i][j] * work[j];
				}
			}

			t1inf = true;
			for (i = nact; i >= 1; i = i - 1) {
				sum = work[i];
				l = iwrm + (i * (i + 3)) / 2;
				l1 = l - i;
				for (j = i + 1; j <= nact; j = j + 1) {
					sum = sum - work[l] * work[iwrv + j];
					l = l + j;
				}
				sum = sum / work[l1];
				work[iwrv + i] = sum;
				if (iact[i] < meq) {
					// continue;
					break;
				}
				if (sum < 0) {
					// continue;
					break;
				}
				t1inf = false;
				it1 = i;
			}

			if (!t1inf) {
				t1 = work[iwuv + it1] / work[iwrv + it1];
				for (i = 1; i <= nact; i = i + 1) {
					if (iact[i] < meq) {
						// continue;
						break;
					}
					if (work[iwrv + i] < 0) {
						// continue;
						break;
					}
					temp = work[iwuv + i] / work[iwrv + i];
					if (temp < t1) {
						t1 = temp;
						it1 = i;
					}
				}
			}

			sum = 0;
			for (i = iwzv + 1; i <= iwzv + n; i = i + 1) {
				sum = sum + work[i] * work[i];
			}
			if (Math.abs(sum) <= vsmall) {
				if (t1inf) {
					ierr[1] = 1;
					// GOTO 999
					return 999;
				} else {
					for (i = 1; i <= nact; i = i + 1) {
						work[iwuv + i] = work[iwuv + i] - t1 * work[iwrv + i];
					}
					work[iwuv + nact + 1] = work[iwuv + nact + 1] + t1;
					// GOTO 700
					return 700;
				}
			} else {
				sum = 0;
				for (i = 1; i <= n; i = i + 1) {
					sum = sum + work[iwzv + i] * amat[i][nvl];
				}
				tt = -work[iwsv + nvl] / sum;
				t2min = true;
				if (!t1inf) {
					if (t1 < tt) {
						tt = t1;
						t2min = false;
					}
				}

				for (i = 1; i <= n; i = i + 1) {
					sol[i] = sol[i] + tt * work[iwzv + i];
					if (Math.abs(sol[i]) < vsmall) {
						sol[i] = 0;
					}
				}

				crval[1] = crval[1] + tt * sum * (tt / 2 + work[iwuv + nact + 1]);
				for (i = 1; i <= nact; i = i + 1) {
					work[iwuv + i] = work[iwuv + i] - tt * work[iwrv + i];
				}
				work[iwuv + nact + 1] = work[iwuv + nact + 1] + tt;

				if (t2min) {
					nact = nact + 1;
					iact[nact] = nvl;

					l = iwrm + ((nact - 1) * nact) / 2 + 1;
					for (i = 1; i <= nact - 1; i = i + 1) {
						work[l] = work[i];
						l = l + 1;
					}

					if (nact === n) {
						work[l] = work[n];
					} else {
						for (i = n; i >= nact + 1; i = i - 1) {
							if (work[i] === 0) {
								// continue;
								break;
							}
							gc = Math.max(Math.abs(work[i - 1]), Math.abs(work[i]));
							gs = Math.min(Math.abs(work[i - 1]), Math.abs(work[i]));
							if (work[i - 1] >= 0) {
								temp = Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
							} else {
								temp = -Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
							}
							gc = work[i - 1] / temp;
							gs = work[i] / temp;

							if (gc === 1) {
								// continue;
								break;
							}
							if (gc === 0) {
								work[i - 1] = gs * temp;
								for (j = 1; j <= n; j = j + 1) {
									temp = dmat[j][i - 1];
									dmat[j][i - 1] = dmat[j][i];
									dmat[j][i] = temp;
								}
							} else {
								work[i - 1] = temp;
								nu = gs / (1 + gc);
								for (j = 1; j <= n; j = j + 1) {
									temp = gc * dmat[j][i - 1] + gs * dmat[j][i];
									dmat[j][i] = nu * (dmat[j][i - 1] + temp) - dmat[j][i];
									dmat[j][i - 1] = temp;

								}
							}
						}
						work[l] = work[nact];
					}
				} else {
					sum = -bvec[nvl];
					for (j = 1; j <= n; j = j + 1) {
						sum = sum + sol[j] * amat[j][nvl];
					}
					if (nvl > meq) {
						work[iwsv + nvl] = sum;
					} else {
						work[iwsv + nvl] = -Math.abs(sum);
						if (sum > 0) {
							for (j = 1; j <= n; j = j + 1) {
								amat[j][nvl] = -amat[j][nvl];
							}
							bvec[nvl] = -bvec[nvl];
						}
					}
					// GOTO 700
					return 700;
				}
			}

			return 0;
		}

		function fn_goto_797() {
			l = iwrm + (it1 * (it1 + 1)) / 2 + 1;
			l1 = l + it1;
			if (work[l1] === 0) {
				// GOTO 798
				return 798;
			}
			gc = Math.max(Math.abs(work[l1 - 1]), Math.abs(work[l1]));
			gs = Math.min(Math.abs(work[l1 - 1]), Math.abs(work[l1]));
			if (work[l1 - 1] >= 0) {
				temp = Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
			} else {
				temp = -Math.abs(gc * Math.sqrt(1 + gs * gs / (gc * gc)));
			}
			gc = work[l1 - 1] / temp;
			gs = work[l1] / temp;

			if (gc === 1) {
				// GOTO 798
				return 798;
			}
			if (gc === 0) {
				for (i = it1 + 1; i <= nact; i = i + 1) {
					temp = work[l1 - 1];
					work[l1 - 1] = work[l1];
					work[l1] = temp;
					l1 = l1 + i;
				}
				for (i = 1; i <= n; i = i + 1) {
					temp = dmat[i][it1];
					dmat[i][it1] = dmat[i][it1 + 1];
					dmat[i][it1 + 1] = temp;
				}
			} else {
				nu = gs / (1 + gc);
				for (i = it1 + 1; i <= nact; i = i + 1) {
					temp = gc * work[l1 - 1] + gs * work[l1];
					work[l1] = nu * (work[l1 - 1] + temp) - work[l1];
					work[l1 - 1] = temp;
					l1 = l1 + i;
				}
				for (i = 1; i <= n; i = i + 1) {
					temp = gc * dmat[i][it1] + gs * dmat[i][it1 + 1];
					dmat[i][it1 + 1] = nu * (dmat[i][it1] + temp) - dmat[i][it1 + 1];
					dmat[i][it1] = temp;
				}
			}

			return 0;
		}

		function fn_goto_798() {
			l1 = l - it1;
			for (i = 1; i <= it1; i = i + 1) {
				work[l1] = work[l];
				l = l + 1;
				l1 = l1 + 1;
			}

			work[iwuv + it1] = work[iwuv + it1 + 1];
			iact[it1] = iact[it1 + 1];
			it1 = it1 + 1;
			if (it1 < nact) {
				// GOTO 797
				return 797;
			}

			return 0;
		}

		function fn_goto_799() {
			work[iwuv + nact] = work[iwuv + nact + 1];
			work[iwuv + nact + 1] = 0;
			iact[nact] = 0;
			nact = nact - 1;
			iter[2] = iter[2] + 1;

			return 0;
		}

		go = 0;
		while (true) {
			go = fn_goto_50();
			if (go === 999) {
				return;
			}
			while (true) {
				go = fn_goto_55();
				if (go === 0) {
					break;
				}
				if (go === 999) {
					return;
				}
				if (go === 700) {
					if (it1 === nact) {
						fn_goto_799();
					} else {
						while (true) {
							fn_goto_797();
							go = fn_goto_798();
							if (go !== 797) {
								break;
							}
						}
						fn_goto_799();
					}
				}
			}
		}

	}

	function solveQP(Dmat, dvec, Amat, bvec, meq, factorized) {
		Dmat = base0to1(Dmat);
		dvec = base0to1(dvec);
		Amat = base0to1(Amat);
		var i, n, q,
			nact, r,
			crval = [], iact = [], sol = [], work = [], iter = [],
			message;

		meq = meq || 0;
		factorized = factorized ? base0to1(factorized) : [undefined, 0];
		bvec = bvec ? base0to1(bvec) : [];

		// In Fortran the array index starts from 1
		n = Dmat.length - 1;
		q = Amat[1].length - 1;

		if (!bvec) {
			for (i = 1; i <= q; i = i + 1) {
				bvec[i] = 0;
			}
		}
		for (i = 1; i <= q; i = i + 1) {
			iact[i] = 0;
		}
		nact = 0;
		r = Math.min(n, q);
		for (i = 1; i <= n; i = i + 1) {
			sol[i] = 0;
		}
		crval[1] = 0;
		for (i = 1; i <= (2 * n + (r * (r + 5)) / 2 + 2 * q + 1); i = i + 1) {
			work[i] = 0;
		}
		for (i = 1; i <= 2; i = i + 1) {
			iter[i] = 0;
		}

		qpgen2(Dmat, dvec, n, n, sol, crval, Amat,
			bvec, n, q, meq, iact, nact, iter, work, factorized);

		message = "";
		if (factorized[1] === 1) {
			message = "constraints are inconsistent, no solution!";
		}
		if (factorized[1] === 2) {
			message = "matrix D in quadratic function is not positive definite!";
		}

		return {
			solution: base1to0(sol),
			value: base1to0(crval),
			unconstrained_solution: base1to0(dvec),
			iterations: base1to0(iter),
			iact: base1to0(iact),
			message: message
		};
	}
	exports.solveQP = solveQP;
}(euriklis.Mathematics.programming));
(function (exports) {
	var epsilon = 1e-8;
	function evaluate_f(fn, x) {
		return fn(x);
	}
	function improvement(fn, x, step) {
		var i, n = x.length, current_f = evaluate_f(fn, x), prevx = x;
		/*copy of the initial x vector*/
		var xcpy = new Array(n), temp, fmin = evaluate_f(fn, x), previous = fmin;
		for (i = 0; i < n; i++)xcpy[i] = x[i];
		/*p --> direction*/
		var p = new Array(n);
		/*this is the initial user included direction*/
		function tempfx() {
			xcpy[i] = x[i] + p[i];
			temp = evaluate_f(fn, xcpy);
		}
		for (i = 0; i < n; i++)p[i] = step;
		for (i = 0; i < n; i++) {
			xcpy[i] = x[i] + p[i];
			temp = evaluate_f(fn, xcpy);
			if (temp < fmin) {
				previous = fmin;
				fmin = temp;
			}
			else {
				p[i] = -p[i];
				xcpy[i] = x[i] + p[i];
				temp = evaluate_f(fn, xcpy);
				if (temp < fmin) {
					previous = fmin;
					fmin = temp;
				}
				else {
					xcpy[i] = x[i];
					temp = fmin;
				}
			}
			x[i] = xcpy[i];
			temp = fmin;
		}
		return { x: x, temp: temp, previous: previous, previousChi: prevx };
	}
	function hooke(fn, x, step, maxiter) {
		var currf, currx, prevx, prevf, its = 0, maxiter = typeof maxiter === "undefined" ? 500 : maxiter;
		do {
			currf = improvement(fn, x, step).temp;
			prevf = improvement(fn, x, step).previous;
			currx = improvement(fn, x, step).x;
			prevx = improvement(fn, x, step).previousChi;
			if (Math.abs(currf - prevf) > epsilon) {
				for (i = 0; i < currx.length; i++) { currx[i] = 2 * currx[i] - prevx[i]; }
				x = currx;
			}
			else {
				step *= 0.5;
				for (i = 0; i < currx.length; i++)currx[i] = 2 * currx[i] - prevx[i];
				x = currx;
			}
			its++;
		} while ((Math.abs(currf - prevf) > epsilon || step >= epsilon) && its <= maxiter)
		return { x: x, fmin: currf, iterations: its, step: step };
	}
	exports.hooke = function (fn, x, step, maxiter) {
		var maxiter = typeof maxiter === 'undefined' ? 500 : maxiter,
			currf = hooke(fn, x, step, maxiter);
		var impf = hooke(fn, currf.x, step, maxiter);
		var its = currf.iterations;
		var isNotOptimal = Math.abs(impf.fmin - currf.fmin) >= epsilon && its < maxiter;
		if (isNotOptimal) {
			do {
				currf = hooke(fn, impf.x, step, maxiter);
				impf = hooke(fn, currf.x, step, maxiter);
				its += currf.iterations;
			} while (Math.abs(impf.fmin - currf.fmin) >= epsilon && its < maxiter)
		}
		return { x: impf.x, fmin: impf.fmin, iterations: its };
	}
}(euriklis.Mathematics.programming));
/*
 * The complex M.J.Box algorithm,
 * translated from Fortran 77.
 * Autor: Velislav S. Karastoychev,
 * email:exel_mmm@abv.bg.
 * Date: 5-Aug-2016.
 * Description: Finding the minimum of a 
 * given multivariable function under double constraints
 * Purpose: this program uses the complex method of M.J.Box
 * and is initialy created by Joel A. Richardson and J.L. Kuester
 * in Fortran.To use the program, the user must provide the specifical
 * functions jfunc and jconst1,which describe the objective function 
 * and the constraints.An example how to use the program is the follow.
	 the minimized function                                                                          
	 function jfn(i,n,m,k,l,eks){                                                                    
		  var f = (9 - Math.pow(eks[0] - 3,2))*Math.pow(eks[1],3)/(27*Math.sqrt(3));               
		  return f;                                                                                  
	 }                                                                                               
	 //the constranits:                                                                                
	 function jcn(n,m,k,eks,i,l){                                                                  
		var g = new Array(),h = new Array();                                                         
		eks[2] = eks[0] + Math.sqrt(3)*eks[1];                                                    
		g[0] = 0.0;                                                                                  
		g[1] = 0.0;                                                                                  
		g[2] = 0;                                                                                    
		h[0] = 100;                                                                                  
		h[1] = eks[0]/Math.sqrt(3);                                                                 
		h[2] = 6;                                                                                    
		return {g:g,h:h,chi:eks};                                                                      
	 }                                                                                               
	 //the parameters:                                                                                 
	 var eks = [],alpha = 1.3,beta = 0.001,gamma = 5,delta = 0.0001,                                   
	 itmax = 100,n = 2,m = 3,l = 3,k = 4;                                                            
	 for(i = 0;i < l;i++){                                                                                                                                                                                                                                
		  eks[i] = i === 0?1:                                                         
		  i === 1?0.5:                                                                 
		  i === 2?eks[0] + Math.sqrt(3)*eks[1]:0;                                                                                                                              
	 }                                                                                                   
	 //executing:                                                                                           
	 euriklis.Mathematics.programming.Box(k,l,m,n,eks,jfn,jcn,alpha,beta,gamma,delta,itmax);                               
	 output:=> { x: [ 3.0003939306264016, 1.731787690628987, 5.99993819871818 ],                         
	 fmin: 0.9995443200842825,                                                                           
	 iterations: 90 }                                                                                    
 
 */
(function (exports) {
	/*
	 * Create an k x n matrix with elements of 
	 * random numbers.We use the John Burkardt routine
	 * writen in Fortran (modified 23-Jan-2006).The name
	 * "rn" of the original routine is renamed with "random".
	 */
	function random(m, n, seed) {
		var i, j, k, rn = new Array();
		for (i = 0; i < m; i++) {
			rn[i] = [];
			for (j = 0; j < n; j++) {
				seed = parseInt(seed);
				k = parseInt(seed / 127773);
				seed = parseInt(16807 * (seed - k * 127773) - k * 2836);
				if (seed < 0) seed += 2147483647;
				rn[i][j] = seed * 4.656612875e-10;
			}
		}
		return rn;
	}
	function jconsx(n, m, l, k, x, alpha, beta, gamma, delta, itmax, jconst1, jfunc) {
		var f = new Array(),/*The current function values in points 0,1,2,3...k*/
			k1,/*for loop limit*/
			kode,/*integer --> 1:there is implicit variables,0: no implicit variables*/
			kount,/*counter for the gamma convergence criteria*/
			i,/*counter for the functions jfunc,jconst1 and other*/
			j, ii, jj,/*counters of the for loop*/
			iev1, iev2,/*minimum and maximum function value indices*/
			icm,/*counter of the min-max for loop*/
			g,/*lower constraint array*/
			h,/*upper constraint array*/
			xc,/*centroid array*/
			it,/*current iteration*/
			r = random(k, n, 12345);/*random numbers array*/
		/*
		 * define the iterations counter and check if the problem
		 * has inplicit variables and 
		 * zero the (k - 1) rows of the x matrix if is not zero 
		 */
		it = 1;
		kode = m - n <= 0 ? 0 : 1;
		for (ii = 1; ii < k; ii++) {
			for (j = 0; j < n; j++)x[ii][j] = 0.0;
		}
		//console.log('Initial x matrix:' + x);
		/* Calculate the complex points and check
		 * against constraints:
		 */
		for (ii = 1; ii < k; ii++) {
			for (j = 0; j < n; j++) {
				i = ii;
				g = jconst1(n, m, k, x, i, l).g;
				h = jconst1(n, m, k, x, i, l).h;
				x = jconst1(n, m, k, x, i, l).chi;
				x[ii][j] = g[j] + r[ii][j] * (h[j] - g[j]);
			}
			k1 = ii + 1;
			x[ii][j] = jcek1(i, n, m, k, x, kode, delta, l, k1, xc).chi[j];
			g = jcek1(i, n, m, k, x, kode, delta, l, k1, xc).g;
			h = jcek1(i, n, m, k, x, kode, delta, l, k1, xc).h;
			//xc = jcek1(i,n,m,k,x,kode,delta,l,k1,xc).centroid;
		}
		k1 = k;
		/*
		 * Calculate the f points and define the convergence
		 * factor kount.
		 */
		for (i = 0; i < k; i++)f[i] = jfunc(i, n, m, k, l, x);
		kount = 1;
		/*
		 * While the current iteration it is smaller than 
		 * the maximum iterations number itmax do the follow:
		 */
		do {
			/* find the points with lowest and hightest function value */
			iev1 = 0, iev2 = 0;
			for (icm = 1; icm < k; icm++) {
				if (f[iev1] > f[icm]) iev1 = icm;
				if (f[iev2] < f[icm]) iev2 = icm;
			}
			/*check convergence criteria*/
			if (f[iev2] - f[iev1] >= beta) {
				kount = 1;
			}
			else {
				kount += 1;
				if (kount >= gamma) break;
			}
			/* replace point with lowest function value */
			xc = jcent(n, m, k, iev1, x, k1);
			for (j = 0; j < n; j++) {
				x[iev1][j] *= -alpha;
				x[iev1][j] += (1 + alpha) * xc[j];
			}
			i = iev1;
			x[i] = jcek1(i, n, m, k, x, kode, delta, l, k1, xc).chi;
			g = jcek1(i, n, m, k, x, kode, delta, l, k1, xc).g;
			h = jcek1(i, n, m, k, x, kode, delta, l, k1, xc).h;
			xc = jcek1(i, n, m, k, x, kode, delta, l, k1, xc).centroid
			f[i] = jfunc(i, n, m, k, l, x);
			/*
			 * While a point repeats with lowest function value, 
			 * replace the hightest function value if 
			 * repeats as lowest function value:
			 */
			do {
				iev2 = 0;
				for (icm = 1; icm < k; icm++) {
					if (f[iev2] > f[icm]) iev2 = icm;
				}
				if (iev2 != iev1) break;
				for (jj = 0; jj < n; jj++) {
					x[iev1][jj] += xc[jj];
					x[iev1][jj] /= 2;
				}
				i = iev1;
				x[i] = jcek1(i, n, m, k, x, kode, delta, l, k1, xc).chi;
				g = jcek1(i, n, m, k, x, kode, delta, l, k1, xc).g;
				h = jcek1(i, n, m, k, x, kode, delta, l, k1, xc).h;
				xc = jcek1(i, n, m, k, x, kode, delta, l, k1, xc).centroid;
				f[i] = jfunc(i, n, m, k, l, x);
			} while (true);
			it += 1;
		} while (it <= itmax);
		return { x: x[iev1], fmin: f[iev1], iterations: it };
	}
	function jcek1(i, n, m, k, x, kode, delta, l, k1, xc) {
		var g, h, xc, kt, jc, nn;
		do {
			kt = 0;
			jc = jconst1(n, m, k, x, i, l);
			g = jc.g;
			h = jc.h;
			x = jc.chi;
			/*
			 * check against the explict variablws
			 */
			for (j = 0; j < n; j++) {
				if (x[i][j] <= g[j]) x[i][j] = g[j] + delta;
				else {
					if (h[j] <= x[i][j]) x[i][j] = h[j] - delta;
				}
			}
			if (kode === 0) break;
			/*
			 * check against the implicit constraints
			 */
			nn = n;
			for (j = nn; j < m; j++) {
				jc = jconst1(n, m, k, x, i, l);
				g = jc.g;
				h = jc.h;
				x = jc.chi;
				if ((x[i][j] < g[j]) || ((x[i][j] >= g[j]) && (h[j] < x[i][j]))) {
					iev1 = i;
					kt = 1;
					xc = jcent(n, m, k, iev1, x, k1);
					for (jj = 0; jj < n; jj++) {
						x[i][jj] += xc[jj];
						x[i][jj] /= 2;
					}
				}
			}
		} while (kt > 0);
		return { chi: x[i], g: g, h: h, centroid: xc };
	}
	function jcent(n, m, k, iev1, x, k1) {
		var j, il, rk, xc = new Array();
		for (j = 0; j < n; j++) {
			xc[j] = 0.0;
			for (il = 0; il < k1; il++)xc[j] += x[il][j];
			rk = k1 - 1;
			xc[j] -= x[iev1][j];
			xc[j] /= rk;
		}
		return xc;
	}
	function jconst1(n, m, k, x, i, l) {
		var ret = jcn(n, m, k, x[i], i, l);
		ret.chi = x;
		return ret;
	}
	function jfunc(i, n, m, k, l, x) {
		return jfn(i, n, m, k, l, x[i]);
	}
	function _main_(k, l, m, n, eks, jfn, jcn, alpha, beta, gamma, delta, itmax) {
		var x = new Array(k), ii, jj;
		/*creating and initialization of x matrix:*/
		for (ii = 0; ii < k; ii++) {
			x[ii] = new Array(l);
			for (jj = 0; jj < l; jj++)x[ii][jj] = ii === 0 ? eks[jj] : 0.0;
		}
		return jconsx(n, m, l, k, x, alpha, beta, gamma, delta, itmax, jconst1, jfunc);
	}
	exports.Box = _main_;

})(euriklis.Mathematics.programming);
(function (exports) {
	function market(fx, x, maxIter) {
		var i, improvement, iterations = 0, stop = false,
			grad, maxIter = maxIter || 1000, message = '',
			gradient = euriklis.Mathematics.gradient, epsilon = 0;
		while (1) {
			iterations += 1;
			grad = gradient(fx, x);
			for (i = 0; i < x.length; i++) {
				improvement = - grad[i] / 2;
				x[i] += improvement;
			}
			grad = gradient(fx, x);
			stop = grad.every(elem => Math.abs(elem) <= epsilon);
			if (iterations === maxIter) message =
				"Probably do not exist global minimum of the function";
			if (stop || iterations === maxIter) break;

		}
		return {
			fmin: message === '' ? fx(x) : '',
			x: message === '' ? x : '',
			message: message,
			iterations: iterations
		}
	}
	exports.optimize = market;
})(euriklis.Mathematics.programming);
euriklis.Mathematics.programming.minimize = (f, x_init, tol, maxit, callback, gradient, options) => {
	'use strict';
	let grad = euriklis.Mathematics.gradient, max = Math.max;
	if (typeof options === "undefined") { options = {}; }
	tol = typeof tol === "undefined" ? tol = 1e-8 : max(tol, Number.MIN_VALUE);
	if (typeof gradient === "undefined") { gradient = function (x) { return [grad(f, x.M[0])].toMatrix(); }; }
	if (typeof maxit === "undefined") maxit = 1000;
	const type_x = x_init.constructor;
	let modified_x_init = type_x === Array ?
		x_init.length === 1 && x_init[0].length > 0 ? x_init.toMatrix() :
			x_init.length > 1 && !isNaN(x_init[0]) ? [x_init].toMatrix() :
				euriklis.nrerror("Minimize routine:incorrect initiial x vector!!!") :
		type_x === euriklis.Mathematics.Matrix ? x_init.rows === 1 ? x_init :
			euriklis.nrerror('Minimize routine:incorrect input of the initial x vector!') :
			euriklis.nrerror("Minimize routine: the initial x vector must be Array(n) Array([n]) or Matrix(1,n) type!");
	let x0 = euriklis.Mathematics.cloning(modified_x_init), n = x0.columns,
		f0 = f(x0.M[0]), f1, df0, /* f must be determined like Array(n) function */
		step, g0, g1, H1 = options.Hinv || euriklis.Mathematics.identity(n),
		it = 0, i, s, x1, y, Hy, Hs, ys, i0, t, nstep, t1, t2, message = "";
	if (isNaN(f0)) euriklis.nrerrorr('Minimize routine: f(x0) is a not a number!');
	g0 = gradient(x0);
	while (it < maxit) {
		if (typeof callback === "function") {
			if (callback(it, x0, f0, g0, H1)) {
				message = "Callback returned true"; break;
			}
		} /* end if */
		if (!g0.M[0].toMatrix().isEveryElementNumber()) {
			message = "Minimize routine: some of  the gradient elements is not a number!";
			break;
		} /* end if */
		step = H1.times(g0.transpose()).times(-1);
		if (!step.transpose().M[0].toMatrix().isEveryElementNumber()) {
			message = "Minimize routine: some element of the search direction vector is not a number!";
			break;
		}/* end if */
		nstep = step.FrobeniusNorm();
		if (nstep < tol) { message = "Minimize routine : Newton step smaller than tol"; break; }
		t = 1;
		df0 = g0.times(step).M[0][0];
		/* line search */
		x1 = x0;
		while (it < maxit) {
			if (t * nstep < tol) { break; }
			s = step.times(t);
			x1 = x0.transpose().plus(s).transpose();
			f1 = f(x1.M[0]);
			if (f1 - f0 >= 0.1 * t * df0 || isNaN(f1)) {
				t *= 0.5;
				++it;
				continue;
			}
			break;
		}
		if (t * nstep < tol) { message = "Minimize routine: Line search step size smaller than tolerance"; break; }
		if (it === maxit) { message = "Minimize routine : maxit reached during line search"; break; }
		g1 = gradient(x1);
		y = g1.transpose().minus(g0.transpose());
		ys = y.transpose().times(s).M[0][0];
		Hy = H1.times(y);
		H1 = H1.plus(s.times(s.transpose()).times((ys + y.transpose().times(Hy).M[0][0]) / (ys * ys)))
			.minus(Hy.times(s.transpose()).plus(s.times(Hy.transpose())).times(1 / ys));
		x0 = x1;
		f0 = f1;
		g0 = g1;
		++it;
	}
	return { solution: x0, f: f0, gradient: g0, 'inverse Hessian': H1, iterations: it, message: message }
}
euriklis.Mathematics.programming.simplex = function simplex(a, b, c, meq, mge, maximin, maxIter, fast) {
	/*
	LP programm
	c --> the object function coefficients like Array {size:1xn}
	a --> the subject matrix {size:mxn}
	b --> the b matrix {size:mx1}
	meq --> the number of equality restrictions.By default meq = 0.
	mge --> the number of greater or equal restrictions.By default = 0.
	An example:
	''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
	' c = 2x + 3y -5z                                              '
	' s.t.                                                         '
	' -2x + 7y - z = 6                                             '  
	' 12x + y - 7z = 11                                            '
	' x + 3.5y - 11z >= 29                                         '
	' 1.7x - 2y + 9z <= 19                                         ' 
	' 10x - 3y + 4z <= 38                                          '
	''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
	First, we always write the equal restrictions,then we continue with
	the greater or equal restrictions and the last restrictions are the
	mle restrictions by definition.In our example the simplex arguments 
	are:
	c = [[2,3,-5]],
	a = [[-2,7,-1],
		 [12,1,-7],
		 [1,3.5,-11],
		 [1.7,-2,9],
		 [10,-3,4]],
	 b = [[6,11,29,19,38]],
	 meq = 2,mge = 1.
	 An other example is the following:
	 a = [[2,1],
		  [1,3]],
	  b = [[4,5]],
	  c = [[5,4]],meq =0,mge = 1;
	  or other:
	  a = [[1,1],[2,1],[-3,2]],b = [[3,5,3]],c = [[20,15]],meq = 1,mge =1;
	*/
	var maxIter = typeof maxIter === 'undefined' ? 1e+3 : maxIter,
		currIter = 0, epsilon = 1e-10, isNotOptimal = true,
		solutionHistory = new Array(), fast = typeof fast === 'undefined' ? false : fast;
	function areNearlyEqual(num1, num2) {
		return Math.abs(num1 - num2) <= epsilon;
	}
	var cln = euriklis.Mathematics.cloning, i, j, k,
		complex = euriklis.Mathematics.complex,
		a = cln(a), b = cln(b), c = cln(c);
	var m = a.rows, mle = m - meq - mge;
	/*Creating of the canonical a matrix*/
	/*aa --> appendix of a matrix*/
	var aa = euriklis.Mathematics.createMatrix(a.rows, mge + a.rows);
	for (i = 0; i < aa.rows; i++) {
		for (j = 0; j < aa.columns; j++) {
			if ((i < meq) && (j !== a.rows - meq + i)) {
				aa.M[i][j] = 0.0;
			}
			if ((i < meq) && (j === a.rows - meq + i)) {
				aa.M[i][j] = 1.0;
			}
			if ((i >= meq) && (i < meq + mge) && (j === (i - meq)) && (j < a.rows)) {
				aa.M[i][j] = -1.0;
			}
			if ((i >= meq) && (i < meq + mge) && (j !== i - meq) && (j < a.rows)) {
				aa.M[i][j] = 0.0;
			}
			if ((i >= meq) && (i < meq + mge) && (j >= a.rows) && (j === a.rows - meq + i)) {
				aa.M[i][j] = 1.0;
			}
			if ((i >= meq) && (i < meq + mge) && (j >= a.rows) && (j !== a.rows - meq + i)) {
				aa.M[i][j] = 0.0;
			}
			if ((i >= meq + mge) && (i < a.rows) && (j === i - meq)) {
				aa.M[i][j] = 1.0;
			}
			if ((i >= meq + mge) && (i < a.rows) && (j !== i - meq)) {
				aa.M[i][j] = 0.0;
			}
		}
	}
	/*cfa --> canonical form of a:*/
	var cfa = cln(a);
	for (i = 0; i < aa.columns; i++)cfa.addLastColumn(aa.getColumn(i));
	cfa.addLastColumn(b.transpose());
	/*cm --> coefficient matrix:*/
	var cm = new Array();
	for (i = 0; i < c.columns; i++)cm.push(new complex(c.M[0][i]));
	for (i = 0; i < a.rows - meq; i++) {
		cm.push(new complex(0));
	}
	for (i = 0; i < meq + mge; i++) {
		maximin === 'min' ? cm.push(new complex(0, 1)) :
			cm.push(new complex(0, -1));
	}
	/*basis:we set the initial basis!*/
	/*in fact we save the indices of the cm matrix*/
	var basis = new Array(), z = new Array(), zmc = new Array();
	for (i = 0; i < cfa.rows; i++) {
		for (j = cfa.columns - 2; j > a.columns - 1; j--) {
			if (cfa.M[i][j] !== 0) {
				basis.push(j);
				break;
			}
		}
	}
	var zrcmplx = new complex(0);
	//basis = basis.reverse();
	function z_obtain() {
		for (i = 0; i < cfa.columns; i++) {
			z[i] = zrcmplx;
			zmc[i] = new complex(0);
			for (j = 0; j < basis.length; j++) {
				z[i] = z[i].plus(cm[basis[j]].times(cfa.M[j][i]));
			}
		}
		for (i = 0; i < z.length; i++)zmc[i] = i !== z.length - 1 ? z[i].minus(cm[i]) : z[i];
	}
	function selectInputVariable(zmc) {
		var i, j, zcre = new Array(), zcim = new Array(), its = true, itr1 = 0,
			maxim = { val: [], ind: [] }, maxre = { val: [], ind: [] }, its1 = true, itr = 0, inputVar;
		for (i = 0; i < zmc.length - 1; i++) {
			zcre[i] = zmc[i].Re;
			zcim[i] = zmc[i].Im;
		}
		while (its) {
			var ind = maximin === 'min' ? zcim.indexOf(Math.max.apply(null, zcim)) :
				zcim.indexOf(Math.min.apply(null, zcim));
			if (maxim.val.length == 0 && maxim.ind.length === 0) {
				maxim.val.push(zcim[ind]);
				maxim.ind.push(ind + itr);
			}
			else {
				if (areNearlyEqual(maxim.val[0], zcim[ind])) {
					maxim.val.push(zcim[ind]);
					maxim.ind.push(ind + itr);
				}
			}
			zcim.splice(ind, 1);
			itr += 1;
			var ind1 = maximin === 'min' ? zcim.indexOf(Math.max.apply(null, zcim)) :
				zcim.indexOf(Math.min.apply(null, zcim));
			if (areNearlyEqual(maxim.val[0], zcim[ind1]) && ind1 !== -1) {
				maxim.val.push(zcim[ind1]);
				maxim.ind.push(ind1 + itr);
				zcim.splice(ind1, 1);
				itr += 1;
				if (zcim.length === 0) break;
			}
			else its = false;
		}
		do {
			var inc = maximin === 'min' ? zcre.indexOf(Math.max.apply(null, zcre)) :
				zcre.indexOf(Math.min.apply(null, zcre));
			if (maxre.val.length == 0 && maxre.ind.length === 0) {
				maxre.val.push(zcre[inc]);
				maxre.ind.push(inc + itr1);
			}
			else {
				if (areNearlyEqual(maxre.val[0], zcre[inc])) {
					maxre.val.push(zcre[inc]);
					maxre.ind.push(inc + itr1);
				}
			}
			zcre.splice(inc, 1);
			itr1 += 1;
			var inc1 = maximin === 'min' ? zcre.indexOf(Math.max.apply(null, zcre)) :
				zcre.indexOf(Math.min.apply(null, zcre));
			if (areNearlyEqual(maxre.val[0], zcre[inc1]) && inc1 !== -1) {
				maxre.val.push(zcre[inc1]);
				maxre.ind.push(inc1 + itr1);
				zcre.splice(inc1, 1);
				itr1 += 1;
				if (zcre.length === 0) break;
			}
			else its1 = false;
		} while (its1)
		if (maxim.val.every(elem => areNearlyEqual(elem, 0))) {
			inputVar = maxre.ind[0];
		}
		else {
			var reim = new Array();
			for (i = 0; i < maxim.ind.length; i++)reim.push(zmc[maxim.ind[i]].Re);
			inputVar = maximin === 'min' ? maxim.ind[reim.indexOf(Math.max.apply(null, reim))] :
				maxim.ind[reim.indexOf(Math.min.apply(null, reim))];
		}
		return inputVar;
	}
	function selectOutputVariable(cfa, ivar) {
		var i, d, delta = new Array(), col = cfa.columns, m = cfa.rows;
		for (i = 0; i < m; i++) {
			d = cfa.M[i][col - 1] / cfa.M[i][ivar];
			cfa.M[i][col - 1] < 0 || cfa.M[i][ivar] < 0 ? delta.push(Infinity) : delta.push(d);
		}
		outputVar = delta.indexOf(Math.min.apply(null, delta));
		return outputVar;
	}
	function gaussianElimination(cfa, ivar, ovar) {
		var i, j, leadel = cfa.M[ovar][ivar],
			leadrow = [cfa.getRow(ovar).M].toMatrix().times(1 / leadel);
		cfa.M[ovar] = leadrow.M[0];
		for (i = 0; i < cfa.rows; i++) {
			if (i !== ovar) {
				var leadeli = cfa.M[i][ivar];
				var eliminator = leadrow.times(leadeli);
				cfa.M[i] = [cfa.getRow(i).M].toMatrix().minus(eliminator).M[0];
			}
		}
		return cfa;
	}
	function z_check() {
		var condition = true;
		for (i = 0; i < zmc.length; i++) {
			if (maximin === 'min') {
				if (zmc[i].Im > 0 || (zmc[i].Re > 0 && zmc[i].Im == 0)) {
					condition = false;
					break;
				}
			}
			if (maximin === 'max') {
				if (zmc[i].Im < 0 || (zmc[i].Re < 0 && zmc[i].Im == 0)) {
					condition = false;
					break;
				}
			}
		}
		return condition;
	}
	function saveCurrentSolution() {
		var solutions = new Object();
		solutions.a = cfa.getBlock([0, 0], [cfa.rows - 1, cfa.columns - 2]);
		solutions.b = cfa.getBlock([0, cfa.columns - 1], [cfa.rows - 1, cfa.columns - 1]);
		solutions.z = cln(z).M;
		solutions.zmc = cln(zmc).M;
		solutions.optimal = zmc[cfa.columns - 1];
		solutions.basis = cln(basis).M;
		solutionHistory.push(solutions);
	}
	var ivar, ovar;
	do {
		++currIter;
		saveCurrentSolution();
		z_obtain();
		var condition = z_check();
		if (condition || currIter >= maxIter) {
			isNotOptimal = false;
		}
		else {
			ivar = selectInputVariable(zmc);
			ovar = selectOutputVariable(cfa, ivar);
			gaussianElimination(cfa, ivar, ovar);
			basis[ovar] = ivar;

		}
	} while (isNotOptimal);
	saveCurrentSolution();
	var outputSimplex = {
		history: solutionHistory,
		basis: basis,
		'chi values': cfa.getColumn(cfa.columns - 1).M, optimum: z[z.length - 1],
		a: cfa,
		zmc: zmc,
		iterations: currIter
	};
	//if(!fast)outputSimplex.history = solutionHistory;
	return outputSimplex;
}
euriklis.Mathematics.programming.unconstrainedOptimization = function (f, x0, method, opt) {
	'use strict';
	const methods = ['nelder and mead simplex method', 'newton']
	if (typeof f === "undefined" || !f instanceof Function) {
		euriklis.nrerror("The optimization function is not insided!")
	}
	if (typeof x === "undefined" || !x instanceof Array || f.arguments.x.length !== x0.length) {
		x0 = new Array(f.arguments.x.length)
		x0 = x0.map(el => {
			return el = Math.random()
		})
	}
	if (typeof method === 'undefined' || methods.some(el => {
		return el === method.toLowerCase()
	})) method = methods[0]

	function NelderMeadSimplex(f, x0, maxiter, step) {
		/**
		 * create n initial estimations
		 * of random x vectors ...
		 */
		maxiter = typeof maxiter === "undefined" ? 1000 : maxiter
		step = typeof step === "undefined" ? 1e-8 : step
		let n = x0.length,
			x = new Array(n + 1), F = new Array(n + 1)
		x.push(x0), F.push(f(x0)), i, j, fmax,
			iter = 0, xc = new Array(), temp
		for (i = 1; i <= n; i++) {
			x[i] = new Array()
			for (j = 0; j < n; j++) {
				x[i][j] = (1 + Math.random()) * x[0][j]
			}
			F[i] = f(x[i])
		}
		/**
		 * find the roundoff constant
		 * of the machine ...
		 */
		fmax = Math.max(...F), roff = fmax,
			fmin = Math.min(...F), xc = x
		while (iterr < maxiter + 1 || fmax - fmin <= step) {
			/**
			 *  find the reflection point:
			 */
			k = F.indexOf(fmax)
			/**
			 * find the centroid:
			 */
			for (i = 0; i < n; i++) {
				temp = 0
				for (j = 0; j <= n; j++) {
					if (j !== k) temp += x[j][i]
				}
				xc[i] = temp / n
			}
			if (f(xc) < fmax) x[k] = xc
			else {
				/**
				 * create vertex with
				 * coordinates 2/3*(xc - x[k]) + x[k]
				 * or so called modified reflection ... 
				 */
				while (f(xc) > fmax) {
					for (i = 0; i < n; i++) xc[i] = 2 / 3 * (xc[i] - x[k][i]) + x[k][i]
				}
				x[k] = xc
			}
			for (i = 0; i <= n; i++) {
				F[i] = f(x[i])
			}
			fmax = Math.max(...F)
			fmin = Math.min(...F)
			++iter
		}
		return {
			x: x[F.indexOf(fmin)],
			f: fmin,
			iterations: iter,
			message: iter === maxiter ? 'The iterations are limited. This value is probably not local minimum.' : ''
		}
	}
	function SDM(f, x0, maxiter, step) {
		const g = euriklis.Mathematics.gradient,
			norm = (vector) => {
				let n = vector.length, norm = 0
				for (i = 0; i < n; i++) norm += vector[i] * vector[i]
				return Math.sqrt(norm)
			},
			linearSearch = (f, x, linSearchMethod) => {
				if (linSearchMethod === "Armijo line search") {
					k;
				}
			}
		let x = x0, iter = 0, p, s, linSearchMethod;
		linSearchMethod = typeof opt["linear search method"] === "undefined" ? "Armijo line search" :
			opt["linear search method"]
		while (norm(g(f, x)) > step || iter < maxiter + 1) {
			p = [g(f, x)].toMatrix().times(-1)
			s = linearSearch(f, x, p, linSearchMethod)
			x = [x].toMatrix().plus(p.times(s)).M[0]
			++iter
		}
		return { x: x, f: f(x), iterations: iter }
	}
	let main = (method, f, x0, step, maxiter) => {
		let args = [f, x0, step, maxiter]
		if (method === methods[0]) return NelderMeadSimplex(...args)
		else if (method === methods[1]) return Newton(...args)
	}
	return main(methods.indexOf(method), f, x0, maxiter)
}
euriklis.Mathematics.programming.SLP_EQP = (f, h, g, x0, maxit, delta0, delta_lp, rho_u, eta) => {
	/**
	 * This code implements the SLIQUE algorithm of R.H. Byrd et al for optimization
	 * with sequential linear programming and equality constrained quadratic program
	 * procedures
	 */
	'use strict';
	const n = x0.toMatrix().columns, epsilon = 0.1, v_init = 10, v_inf = 1e10,
		/** NEQ --> Number of equality constraints, NINEQ --> Number of inequality constraints */
		tol1 = 10e-8, tol2 = 10e-8, NEQ = h.length, NINEQ = g.length;
	let it = 0, x_init = x0.toMatrix();
	maxit = maxit || 1000;
	delta0 = delta0 || 1;
	delta_lp = 0.8 * delta0 / Math.sqrt(n);
	rho_u = rho_u || 10e-8;
	eta = eta || 0.1;
	let min = Math.min, max = Math.max, abs = Math.abs,
		isNotOptimal = false, solveLP = euriklis.Mathematics.programming.simplex,
		solveQP = euriklis.Mathematics.programming.solveQP,
		grad = euriklis.Mathematics.gradient,
		J = euriklis.Mathematics.Jacobian,
		H = euriklis.Mathematics.Hessian, v_k1 = 1e-8;
	/**
	 * procedures:
	 * Step 1: Estimate LP (x, v)[d_LP] and take d_LP --> Algorithm LPPH-3.4 
	 */
	let LPPH = (x, v, delta_lp) => {
		let i, j, df = grad(f, x);
		/**create the c simplex vector: */
		let cc = new Array(n + 2 * NEQ + NINEQ);
		for (i = 0; i < cc.length; i++) i < n ? df[i] : v;
		/** create the A simplex matrix: */
		let A = new Array(2 * n + NEQ + NINEQ);
		for (i = 0; i < A.length; i++) {
			A[i] = new Array(n + 2 * NEQ + NINEQ);
			for (j = 0; j < n + 2 * NEQ + NINEQ; j++) {
				if (i < NEQ) {
					if (j < n) {
						let hi = h[i];
						let higrad = grad(hi, x);
						A[i][j] = higrad[j];
						A[i][i + n] = -1;
						A[i][i + n + NEQ] = 1;
					} else A[i][j] = A[i][j] || 0;
				} else {
					if (i >= NEQ && i < NEQ + NINEQ) {
						if (j < n) {
							let gi = g[i - NEQ];
							A[i][j] = grad(gi, x)[j];
							A[i][i + n + NEQ] = 1;
						} else A[i][j] = A[i][j] || 0;
					} else {
						if (i >= NEQ + NINEQ && i < 2 * n + NEQ + NINEQ) {
							let AI = i - NEQ - NINEQ;
							A[i][j] = (AI % 2 === 0 && j === (AI / 2)) ? 1 :
								((AI % 2 !== 0) && j === (AI - 1) / 2) ? -1 : 0;
						}
					}
				}
			}
		}
		/** create the b simplex vector: */
		let b = [new Array(A.length)];
		for (i = 0; i < A.length; i++) {
			b[0][i] = i < NEQ ? h[i](x) :
				i >= NEQ && i < NEQ + NINEQ ? g[i - NEQ](x) : delta_lp;
		}
		/** compute the optimal solution: */
		let d_lp = new Array(), d_solution = solveLP(A, b, cc, NEQ, NINEQ);
		for (i = 0; i < d_solution.basis.length; i++) {
			let basis = d_solution.basis;
			d_lp[i] = d_solution['chi values'][basis.indexOf(i)].Re;
		}
		return d_lp.toMatrix();
	};
	/** define the ksi (ξ): */
	let ksi = (x, d_lp) => {
		let i, ksi = 0,
			d = d_lp.getBlock([0, 0], [NEQ + NINEQ - 1, 0]);
		for (i = 0; i < NEQ; i++) ksi += h[i](x) + [grad(h[i], x)].toMatrix().times(d).M[0][0];
		for (i = 0; i < NINEQ; i++) ksi += max(0, -g[i](x) - [grad(g[i], x)].toMatrix().times(d).M[0][0]);
		ksi /= NEQ + NINEQ;
		return ksi;
	};
	/** Penalty parameter update strategy: */
	let PPUS = (x, v, delta_lp) => {
		let vk, ksi_v = ksi(x, v), ksi_v_inf = ksi(x, v_inf);
		if (ksi_v < tol1) vk = v;
		else if (ksi_v_inf < tol1) {
			let p = 1.1;
			do {
				vk = p * v;
				if (ksi(x, vk) < tol1 && vk <= v_inf) break;
				p *= p;
			} while (1);
		} else if (ksi_v - ksi_v_inf < tol2) vk = v;
		else {
			let p = 1.1, vkm1 = v;
			do {
				vk = p * v;
				if (ksi(x, vkm1) - ksi(x, vk) >= epsilon * (ksi(x, vkm1) - ksi(x, v_inf)) && vk <= v_inf) break;
				vkm1 = vk;
				p *= p;
			} while (1);
		}
		return vk;
	};
	/** Define the work (active) set: */
	let work = (x, d_lp) => {
		let i, work = new Object(),
			solution = d_lp.getBlock([0, 0], [NEQ + NINEQ - 1, 0]);
		work.h = new Array(), work.g = new Array();
		for (i = 0; i < NEQ + NINEQ; i++) {
			if (i < NEQ && abs([grad(h[i], x)].toMatrix().times(solution).M[0][0] + h[i](x)) <= tol1) work.h.push(i);
			else if (i >= NEQ && i < NINEQ && abs([grad(g[i], x)].toMatrix().times(solution).M[0][0] + g[i](x)) <= tol1) work.g.push(i - NEQ);
		}
		return work;
	};
	/* compute the Jacobian of the working set constraints --> Aw: */
	let Aw = (x, work) => {
		let i, activeSet = new Array();
		for (i = 0; i < work.h.length; i++) activeSet.push(h[work.h[i]]);
		for (i = 0; i < work.g.length; i++) activeSet.push(g[work.g[i]]);
		return J(activeSet, x);
	};
	/** computing the lagrangian least squares multipliers: */
	let lambdaOLSMul = (aw, df) => {
		/**
		 * aw --> the output of Aw, df --> the output of grad (f, x). 
		 */
		const cpdf = [df].toMatrix();
		return cpdf.times(aw).times(aw.times(aw.transpose()).InverseMatrix());
	}
	/**
	 * Evaluation of the Hessian at point x:
	 */
	let evalH = (x) => {
		//
	}
	/**
	 * We use the Byrd notation in the initialisation of the variables.
	 * The upper indices are "translated" with underscore ('_'), and the 
	 * iteratians with parenthesis ('[]')...
	 */
	/*do {
		++it;
		if (it === maxit) isNotOptimal = true;
	
	} while (isNotOptimal);*/
	return LPPH(x0, 1, delta_lp);
}
/*Obtaining the critical values of the Statistical distributions*/
euriklis.Distribution = new Object();
(function (exports) {
	function gammaln(xx) {
		var x, y, tmp, ser, j;
		var cof = [
			76.18009172947146,
			-86.50532032941677,
			24.01409824083091,
			-1.231739572450155,
			0.1208650973866179e-2,
			-0.5395239384953e-5];
		y = x = xx;
		tmp = x + 5.5;
		tmp -= (x + 0.5) * Math.log(tmp);
		ser = 1.000000000190015;
		for (j = 0; j <= 5; j++) ser += cof[j] / ++y;
		return -tmp + Math.log(2.5066282746310005 * ser / x);
	}
	function beta(z, w) {
		return Math.exp(gammaln(z) + gammaln(w) - gammaln(z + w));
	}
	function gamma(xx) {
		return Math.exp(gammaln(xx));
	}
	function betacf(x, a, b) {
		var m, m2, aa, c, d, del, h, qab, qam, qap,
			MAXIT = 100, EPS = 3.0e-7, FPMIN = 1.0e-30;
		qab = a + b;
		qap = a + 1.0;
		qam = a - 1.0;
		c = 1.0;
		d = 1.0 - qab * x / qap;
		if (Math.abs(d) < FPMIN) d = FPMIN;
		d = 1.0 / d;
		h = d;
		for (m = 1; m <= MAXIT; m++) {
			m2 = 2 * m;
			aa = m * (b - m) * x / ((qam + m2) * (a + m2));
			d = 1.0 + aa * d;
			if (Math.abs(d) < FPMIN) d = FPMIN;
			c = 1.0 + aa / c;
			if (Math.abs(c) < FPMIN) c = FPMIN;
			d = 1 / d;
			h *= d * c;
			aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
			d = 1.0 + aa * d;
			if (Math.abs(d) < FPMIN) d = FPMIN;
			c = 1.0 + aa / c;
			if (Math.abs(c) < FPMIN) c = FPMIN;
			d = 1.0 / d;
			del = d * c;
			h *= del;
			if (Math.abs(del - 1.0) < EPS) break;
		}
		if (m > MAXIT) euriklis.nrerror("a or b is too big, or MAXIT too small in continued fraction for incomplete beta function");
		return h;
	}
	function incomplete_beta(x, a, b) {
		var bt;
		if (x < 0.0 || x > 1.0) euriklis.nrerror("incomplete_beta error: the x can be between 0 and 1!");
		if (x == 0.0 || x == 1.0) bt = 0.0;
		else {
			bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1.0 - x));
			if (x < (a + 1.0) / (a + b + 2.0)) {
				return bt * betacf(x, a, b) / a;
			} else {
				return 1.0 - bt * betacf(1.0 - x, b, a) / b;
			}
		}
	}
	function beta_distribution(x, a, b) {
		if (x < 0.0 || x > 1.0) euriklis.nrerror("beta distribution error: the x can be between 0 and 1!");
		var xpa = Math.pow(x, a - 1), ypb = Math.pow(1 - x, b - 1);
		return xpa * ypb / beta(a, b);
	}
	exports.Beta = beta;
	exports.Beta_pdf = beta_distribution;
	exports.Beta_cdf = incomplete_beta;
}(euriklis.Distribution));
euriklis.Distribution.Typical_Normal_p = function (z) {
	function NormalP(z) {
		if (z >= 0) {
			var d = [1, 0.049867347, 0.0211410061,
				0.0032776263, 0.0000380036, 0.0000488906, 0.000005383];
			var result = 0;
			result = d[0] + (d[1] * z) + ((d[2] * z) * z)
				+ ((d[3] * z) * z * z) + ((d[4] * z) * z * z * z)
				+ ((d[5] * z) * z * z * z * z)
				+ ((d[6] * z) * z * z * z * z * z);
			result = 0.5 * Math.pow(result, (-16));

		}
		else result = NormalP(-z)
		return 1 - result;
	}
	return NormalP(z);
}
euriklis.Distribution.Typical_Normal_z = function (p) {
	function InverseNormal(p) {
		var c = [2.515517, 0.802853, 0.010328];
		var d = [1, 1.432788, 0.189269, 0.001308];
		var t = Math.sqrt(Math.log(1 / (p * p)));
		var numerator = 0;
		var denominator = 0;
		for (i = 0; i < 3; i++)numerator += c[i] * Math.pow(t, i);
		for (i = 0; i < 4; i++)denominator += d[i] * Math.pow(t, i);
		var Xp;
		if (p <= 0.5) Xp = t - numerator / denominator;
		else Xp = -InverseNormal(1 - p);
		return Xp;
	}
	return InverseNormal(p);
}
euriklis.Distribution.Chi_square_p = function (v, b) {
	function Chi_square_p(n, x) {
		var m, u = 1, s = 0, a, i;
		if (n % 2 == 0) {
			m = n / 2 - 1;
			for (i = 0; i <= m; i++) { s += u; u *= (x / (2 * i + 2)); }
			a = s * Math.exp(-x / 2);
		}
		else {
			m = (n - 1) / 2;
			for (i = 0; i <= m - 1; i++) { s += u; u *= (x / (2 * i + 3)); }
			a = 2 - 2 * (euriklis.Distribution.Typical_Normal_p(Math.sqrt(x))) + Math.sqrt(2 * x / Math.PI) * Math.exp(-x / 2) * s;
		}
		return a;
	}
	return Chi_square_p(v, b);
}
euriklis.Distribution.Chi_square_chi = function (v, α, e, value) {
	/****************************************************************************/
	function Linear_Interpolattion_Chi(v, α, e) {
		var X0 = ApproxChiQuantile(v, α), i = 0, X1 = X0 + 0.1, X2;
		function f(x) {
			if (Number.isNaN(euriklis.Distribution.Chi_square_p(v, x)) || !Number.isFinite(euriklis.Distribution.Chi_square_p(v, x))) {
				res = approximationChi(v, x);

			}
			else { res = euriklis.Distribution.Chi_square_p(v, x); }
			return res - α;
		}
		function fn(y, z) { return (f(y) - f(z)) / (y - z); }
		while (Math.abs(X1 - X0) >= e) {
			i += 1;
			X2 = X0 - f(X0) / fn(X0, X1);
			X0 = X1, X1 = X2;
		}
		return { X: X1, ε: Math.abs(X0 - X1), corrected: X1 + Math.abs(X0 - X1) };
	}
	function ApproxChiQuantile(v, a) {
		var t = Math.log(1 / a), res, approximation = 1;
		res = v + 2 * t + 1.62 * Math.sqrt(v * t) + 0.63012 * Math.sqrt(v) * Math.log(t) - 1.12032 * Math.sqrt(v) - 2.48 * Math.sqrt(t) - 0.65381 * Math.log(t) - 0.22872;
		(res > 1) ? approximation = res : approximation = 1;
		return approximation;
	}
	function approximationChi(v, x) {
		var z3 = (Math.pow(x / v, 1 / 3) - (1 - 2 / (9 * v))) / Math.sqrt(2 / (9 * v));
		var p = 1 - euriklis.Distribution.Typical_Normal_p(z3);
		return p;
	}
	return Linear_Interpolattion_Chi(v, α, e)[value];
};
euriklis.Distribution.t_Student_p = function (v, b) {
	function t_Student_p(n, t) {
		var x = t / Math.sqrt(n), a;
		if (n % 2 == 0) {
			var u = 1, s = 0, m = n / 2;
			for (i = 0; i < m; i++) { s += u; u *= ((1 - 1 / (2 * (i) + 2)) / (1 + x * x)); }
			a = 0.5 - 0.5 * (x / Math.sqrt(1 + x * x)) * s;
		}
		if (n % 2 != 0) {
			var u = 1, s = 0, m = (n - 1) / 2;
			for (i = 0; i < m; i++) { s += u; u *= ((1 - 1 / (2 * (i) + 3)) / (1 + x * x)); }
			a = 0.5 - (1 / Math.PI) * (x / (1 + x * x) * s + Math.atan(x));
		}
		return a;
	}
	var result = t_Student_p(v, b);
	(result < 0) ? (result = 0) : (result = result);
	return result;
}
euriklis.Distribution.t_Student = function (v, α, e, value) {
	function Linear_Interpolation_t(v, α, e) {
		var X0 = 1, i = 0, X1 = X0 + 0.1, X2;
		function f(t) { return euriklis.Distribution.t_Student_p(v, t) - α; }
		function fn(y, z) { return (f(y) - f(z)) / (y - z); }
		while (Math.abs(X1 - X0) >= e) {
			i += 1;
			X2 = X0 - f(X0) / fn(X0, X1);
			X0 = X1, X1 = X2;
		}
		return { X: X1, ε: Math.abs(X0 - X1), corrected: X1 + Math.abs(X0 - X1) };
	}
	return Linear_Interpolation_t(v, α, e)[value];
}
euriklis.Distribution.F_Fisher_p = function (F, v1, v2) {
	/*
	function FpLarge(F, v1, v2) {
		var x, F13 = Math.pow(F, 1 / 3), V1 = 2 / (9 * v1), V2 = 2 / (9 * v2);
		x = (F13 * (1 - V2) - (1 - V1)) / Math.sqrt(V1 + V2 * F13 * F13);
		return euriklis.Distribution.Typical_Normal_p(x);
	}
	function F_Fisher_p(F, v1, v2) {
		//Multiplier of the polynomial series
		var w = function w(n, m) {
			if ((m == n && (n != 0 && m != 0)) || (n == 1 && m == -1)) return n;
			else {
				if (m > n && (m - n) % 2 == 0 && m != 0) return m * w(n, m - 2);
				else if (m + 1 == n || (n == 0 && m == 0)) return 1;
				else if (m + 1 < n) return false;
				else if (m - n % 2 != 0) return w(n, m - 1);
			}
		}
		//TRANSFORMATION OF F TO X
		var x = v2 / (v2 + v1 * F);
		//COMPUTING OF F-FISHER CUMULATIVE FUNCTION
		var Fisher = 0;
		if (F <= 0) Fisher = 0;
		else {
			//checking if the v1 and v2 are large numbers
			if (v2 % 2 == 0) {
				for (i = 0; i <= (v2 - 2) / 2; i++) {
					Fisher += w(v1, v1 + 2 * i - 1) / w(0, 2 * i) * Math.pow(x, i);
				}
				Fisher = 1 - Math.pow(1 - x, v1 / 2) * Fisher;
			}
			if (v1 % 2 == 0 && v2 % 2 != 0) {
				for (i = 0; i <= (v1 - 2) / 2; i++) {
					Fisher += w(v2, v2 + 2 * i - 1) / w(0, 2 * i) * Math.pow(1 - x, i);
				}
				Fisher = Math.pow(x, v2 / 2) * Fisher;
			}
			if (v1 % 2 != 0 && v2 % 2 != 0) {
				var θ = Math.atan(Math.sqrt(v1 / v2 * F));
				var A = 0, β = 0;
				if (v2 > 1) {
					for (i = 1; i <= v2 - 2; i = i + 2)A += w(0, i) / w(1, i) * Math.pow(Math.cos(θ), i);
					A = 2 / Math.PI * (θ + Math.sin(θ) * A);
				}
				else if (v2 == 1) A = 2 * θ / Math.PI;
				if (v1 > 1) {
					for (i = 0; i <= v1 - 3; i = i + 2)β += w(v2 + 1, v2 + i) / w(1, i + 1) * Math.pow(Math.sin(θ), i);
					β = (2 / Math.PI) * (w(0, v2 - 1) / w(1, v2 - 2)) * (Math.sin(θ) * Math.pow(Math.cos(θ), v2)) * β;
				}
				else if (v1 == 1) β = 0;
				Fisher = 1 - A + β;
			}
		}
		if (Number.isNaN(Fisher) || !Number.isFinite) Fisher = FpLarge(F, v1, v2);
		return Fisher;
	}
	return F_Fisher_p(F, v1, v2);
	*/
	return 1 - euriklis.Distribution.Beta_cdf(v1 / (v1 + v2 / F), v1 / 2, v2 / 2);
}
euriklis.Distribution.F_Fisher = function (v1, v2, α, e, value) {
	function Linear_Interpolation_F(v1, v2, α, e) {
		var X0;
		if (v1 == 1 && α == 0.1) {
			if (v2 == 1) X0 = 39.86346;
			if (v2 == 2) X0 = 8.52632;
			if (v2 == 3) X0 = 5.53832;
			if (v2 == 4) X0 = 4.54477;
			if (v2 == 5) X0 = 4.06042;
			if (v2 == 6) X0 = 3.77595;
			if (v2 == 7) X0 = 3.58943;
			if (v2 == 8) X0 = 3.45792;
			if (v2 == 9) X0 = 3.36030;
			if (v2 == 10) X0 = 3.28502;
			if (v2 == 11) X0 = 3.22520;
			if (v2 == 12) X0 = 3.17655;
			if (v2 == 13) X0 = 3.13621;
			if (v2 == 14) X0 = 3.10221;
			if (v2 == 15) X0 = 3.07319;
			if (v2 == 16) X0 = 3.04811;
			if (v2 == 17) X0 = 3.02623;
			if (v2 == 18) X0 = 3.00698;
			if (v2 == 19) X0 = 2.98990;
			if (v2 == 20) X0 = 2.97465;
			if (v2 > 20) X0 = 1;
		}
		else {
			if (v1 == 1 && α == 0.05) {
				if (v2 == 1) X0 = 161.4476;
				if (v2 == 2) X0 = 18.5128;
				if (v2 == 3) X0 = 10.1280;
				if (v2 == 4) X0 = 7.7086;
				if (v2 == 5) X0 = 6.6079;
				if (v2 == 6) X0 = 5.9874;
				if (v2 == 7) X0 = 5.5914;
				if (v2 == 8) X0 = 5.3177;
				if (v2 == 9) X0 = 5.1174;
				if (v2 == 10) X0 = 4.9646;
				if (v2 == 11) X0 = 4.8443;
				if (v2 == 12) X0 = 4.7472;
				if (v2 == 13) X0 = 4.6672;
				if (v2 == 14) X0 = 4.6001;
				if (v2 == 15) X0 = 4.5431;
				if (v2 == 16) X0 = 4.4940;
				if (v2 == 17) X0 = 4.4513;
				if (v2 == 18) X0 = 4.4139;
				if (v2 == 19) X0 = 4.3807;
				if (v2 == 20) X0 = 4.3512;
				if (v2 > 20) X0 = 1;
			}
			else X0 = 1;
		}
		var i = 0, X1 = X0 + 0.1, X2;
		function f(F) {
			return euriklis.Distribution.F_Fisher_p(F, v1, v2) - α;
		}
		function fn(y, z) { return (f(y) - f(z)) / (y - z); }
		while (Math.abs(X1 - X0) >= e) {
			i += 1;
			X2 = X0 - f(X0) / fn(X0, X1);
			X0 = X1, X1 = X2;
		}
		return { X: X1, ε: Math.abs(X0 - X1), corrected: X1 + Math.abs(X0 - X1) };
	}
	return Linear_Interpolation_F(v1, v2, α, e)[value];
}
euriklis.Distribution.Durbin_Watson = function (T, k, d) {
	var Durbin = {
		6: { 2: [0.61018, 1.40015] },
		7: {
			2: [0.69955, 1.35635],
			3: [0.46723, 1.89636]
		},
		8: {
			2: [0.76290, 1.33238],
			3: [0.55907, 1.77711],
			4: [0.36744, 2.28664]
		},
		9: {
			2: [0.82428, 1.31988],
			3: [0.62910, 1.69926],
			4: [0.45476, 2.12816],
			5: [0.29571, 2.58810]
		},
		10: {
			2: [0.87913, 1.31971],
			3: [0.69715, 1.64134],
			4: [0.52534, 2.01632],
			5: [0.37602, 2.41365],
			6: [0.24269, 2.82165]
		},
		11: {
			2: [0.92733, 1.32409],
			3: [0.75798, 1.60439],
			4: [0.59477, 1.92802],
			5: [0.44406, 2.28327],
			6: [0.31549, 2.64456],
			7: [0.20253, 3.00447]
		},
		12: {
			2: [0.97076, 1.33137],
			3: [0.81221, 1.57935],
			4: [0.65765, 1.86397],
			5: [0.51198, 2.17662],
			6: [0.37956, 2.50609],
			7: [0.26813, 2.83196],
			8: [0.17144, 3.14940]
		},
		13: {
			2: [1.00973, 1.34040],
			3: [0.86124, 1.56212],
			4: [0.71465, 1.81593],
			5: [0.57446, 2.09428],
			6: [0.44448, 2.38967],
			7: [0.32775, 2.69204],
			8: [0.23049, 2.98506],
			9: [0.14693, 3.26577]
		},
		14: {
			2: [1.04495, 1.35027],
			3: [0.90544, 1.55066],
			4: [0.76666, 1.77882],
			5: [0.63206, 2.02955],
			6: [0.50516, 2.29593],
			7: [0.38897, 2.57158],
			8: [0.28559, 2.84769],
			9: [0.20013, 3.11121],
			10: [0.12726, 3.36038]
		},
		15: {
			2: [1.07697, 1.36054],
			3: [0.94554, 1.54318],
			4: [0.81396, 1.75014],
			5: [0.68519, 1.97735],
			6: [0.56197, 2.21981],
			7: [0.44707, 2.47148],
			8: [0.34290, 2.72698],
			9: [0.25090, 2.97866],
			10: [0.17531, 3.21604],
			11: [0.11127, 3.43819]
		},
		16: {
			2: [1.10617, 1.37092],
			3: [0.98204, 1.53860],
			4: [0.85718, 1.72773],
			5: [0.73400, 1.93506],
			6: [0.61495, 2.15672],
			7: [0.50223, 2.38813],
			8: [0.39805, 2.62409],
			9: [0.30433, 2.86009],
			10: [0.22206, 3.08954],
			11: [0.15479, 3.30391],
			12: [0.09809, 3.50287]
		},
		17: {
			2: [1.13295, 1.38122],
			3: [1.01543, 1.53614],
			4: [0.89675, 1.71009],
			5: [0.77898, 1.90047],
			6: [0.66414, 2.10414],
			7: [0.55423, 2.31755],
			8: [0.45107, 2.53660],
			9: [0.35639, 2.75688],
			10: [0.27177, 2.97455],
			11: [0.19784, 3.18400],
			12: [0.13763, 3.37817],
			13: [0.08711, 3.55716]
		},
		18: {
			2: [1.15759, 1.39133],
			3: [1.04607, 1.53525],
			4: [0.93310, 1.69614],
			5: [0.82044, 1.87189],
			6: [0.70984, 2.06000],
			7: [0.60301, 2.25750],
			8: [0.50158, 2.46122],
			9: [0.40702, 2.66753],
			10: [0.32076, 2.87268],
			11: [0.24405, 3.07345],
			12: [0.17732, 3.26497],
			13: [0.12315, 3.44141],
			14: [0.07786, 3.60315]
		},
		19: {
			2: [1.18037, 1.40118],
			3: [1.07430, 1.53553],
			4: [0.96659, 1.68509],
			5: [0.85876, 1.84815],
			6: [0.75231, 2.02262],
			7: [0.64870, 2.20614],
			8: [0.54938, 2.39602],
			9: [0.45571, 2.58939],
			10: [0.36889, 2.78312],
			11: [0.29008, 2.97399],
			12: [0.22029, 3.15930],
			13: [0.15979, 3.33481],
			14: [0.11082, 3.49566],
			15: [0.07001, 3.64241]
		},
		20: {
			2: [1.20149, 1.41073],
			3: [1.10040, 1.53668],
			4: [0.99755, 1.67634],
			5: [0.89425, 1.82828],
			6: [0.79179, 1.99079],
			7: [0.69146, 2.16189],
			8: [0.59454, 2.33937],
			9: [0.50220, 2.52082],
			10: [0.41559, 2.70374],
			11: [0.33571, 2.88535],
			12: [0.26349, 3.06292],
			13: [0.19978, 3.23417],
			14: [0.14472, 3.39540],
			15: [0.10024, 3.54250],
			16: [0.06327, 3.67619]
		},
		21: {
			2: [1.22115, 1.41997],
			3: [1.12461, 1.53849],
			4: [1.02624, 1.66942],
			5: [0.92719, 1.81157],
			6: [0.82856, 1.96350],
			7: [0.73149, 2.12355],
			8: [0.63710, 2.28988],
			9: [0.54645, 2.46051],
			10: [0.46055, 2.63324],
			11: [0.38035, 2.80588],
			12: [0.30669, 2.97600],
			13: [0.24033, 3.14129],
			14: [0.18198, 3.29979],
			15: [0.13166, 3.44827],
			16: [0.09111, 3.58322],
			17: [0.05747, 3.70544]
		},
		22: {
			2: [1.23949, 1.42888],
			3: [1.14713, 1.54079],
			4: [1.05292, 1.66398],
			5: [0.95783, 1.79744],
			6: [0.86285, 1.93996],
			7: [0.76898, 2.09015],
			8: [0.67719, 2.24646],
			9: [0.58843, 2.40718],
			10: [0.50363, 2.57051],
			11: [0.42363, 2.73452],
			12: [0.34926, 2.89726],
			13: [0.28119, 3.05662],
			14: [0.22003, 3.21061],
			15: [0.16642, 3.35756],
			16: [0.12028, 3.49463],
			17: [0.08315, 3.61880],
			18: [0.05242, 3.73092]
		},
		23: {
			2: [1.25665, 1.43747],
			3: [1.16815, 1.54346],
			4: [1.07778, 1.65974],
			5: [0.98639, 1.78546],
			6: [0.89488, 1.91958],
			7: [0.80410, 2.06093],
			8: [0.71493, 2.20816],
			9: [0.62821, 2.35988],
			10: [0.54478, 2.51449],
			11: [0.46541, 2.67038],
			12: [0.39083, 2.82585],
			13: [0.32172, 2.97919],
			14: [0.25866, 3.12852],
			15: [0.20216, 3.27216],
			16: [0.15274, 3.40865],
			17: [0.11029, 3.53549],
			18: [0.07619, 3.65007],
			19: [0.04801, 3.75327]
		},
		24: {
			2: [1.27276, 1.44575],
			3: [1.18781, 1.54639],
			4: [1.10100, 1.65649],
			5: [1.01309, 1.77526],
			6: [0.92486, 1.90184],
			7: [0.83706, 2.03522],
			8: [0.75048, 2.17427],
			9: [0.66589, 2.31774],
			10: [0.58400, 2.46431],
			11: [0.50554, 2.61260],
			12: [0.43119, 2.76111],
			13: [0.36156, 2.90835],
			14: [0.29723, 3.05282],
			15: [0.23869, 3.19285],
			16: [0.18635, 3.32700],
			17: [0.14066, 3.45402],
			18: [0.10150, 3.57167],
			19: [0.07006, 3.67769],
			20: [0.04413, 3.77297]
		},
		25: {
			2: [1.28791, 1.45371],
			3: [1.20625, 1.54954],
			4: [1.12276, 1.65403],
			5: [1.03811, 1.76655],
			6: [0.95297, 1.88634],
			7: [0.86803, 2.01252],
			8: [0.78400, 2.14412],
			9: [0.70154, 2.28007],
			10: [0.62133, 2.41924],
			11: [0.54401, 2.56041],
			12: [0.47019, 2.70229],
			13: [0.40046, 2.84360],
			14: [0.33536, 2.98300],
			15: [0.27536, 3.11913],
			16: [0.22090, 3.25058],
			17: [0.17231, 3.37604],
			18: [0.12995, 3.49447],
			19: [0.09371, 3.60384],
			20: [0.06465, 3.70220],
			21: [0.04070, 3.79041]
		},
		26: {
			2: [1.30219, 1.46139],
			3: [1.22358, 1.55281],
			4: [1.14319, 1.65225],
			5: [1.06158, 1.75911],
			6: [0.97937, 1.87274],
			7: [0.89717, 1.99240],
			8: [0.81561, 2.11722],
			9: [0.73529, 2.24629],
			10: [0.65683, 2.37862],
			11: [0.58079, 2.51315],
			12: [0.50775, 2.64877],
			13: [0.43825, 2.78436],
			14: [0.37279, 2.91872],
			15: [0.31182, 3.05067],
			16: [0.25578, 3.17904],
			17: [0.20499, 3.30253],
			18: [0.15977, 3.42006],
			19: [0.12041, 3.53067],
			20: [0.08677, 3.63257],
			21: [0.05983, 3.72404]
		},
		27: {
			2: [1.31568, 1.46878],
			3: [1.23991, 1.55620],
			4: [1.16239, 1.65101],
			5: [1.08364, 1.75274],
			6: [1.00421, 1.86079],
			7: [0.92463, 1.97449],
			8: [0.84546, 2.09313],
			9: [0.76726, 2.21588],
			10: [0.69057, 2.34190],
			11: [0.61593, 2.47026],
			12: [0.54385, 2.59997],
			13: [0.47482, 2.73007],
			14: [0.40933, 2.85950],
			15: [0.34780, 2.98721],
			16: [0.29062, 3.11215],
			17: [0.23816, 3.23327],
			18: [0.19072, 3.34944],
			19: [0.14853, 3.45967],
			20: [0.11188, 3.56318],
			21: [0.08057, 3.65833]
		},
		28: {
			2: [1.32844, 1.47589],
			3: [1.25534, 1.55964],
			4: [1.18051, 1.65025],
			5: [1.10444, 1.74728],
			6: [1.02762, 1.85022],
			7: [0.95052, 1.95851],
			8: [0.87366, 2.07148],
			9: [0.79754, 2.18844],
			10: [0.72265, 2.30862],
			11: [0.64947, 2.43122],
			12: [0.57848, 2.55540],
			13: [0.51013, 2.68025],
			14: [0.44486, 2.80489],
			15: [0.38308, 2.92838],
			16: [0.32517, 3.04976],
			17: [0.27146, 3.16812],
			18: [0.22228, 3.28249],
			19: [0.17787, 3.39189],
			20: [0.13843, 3.49546],
			21: [0.10421, 3.59248]
		},
		29: {
			2: [1.34054, 1.48275],
			3: [1.26992, 1.56312],
			4: [1.19762, 1.64987],
			5: [1.12407, 1.74260],
			6: [1.04971, 1.84088],
			7: [0.97499, 1.94420],
			8: [0.90036, 2.05196],
			9: [0.82626, 2.16358],
			10: [0.75316, 2.27837],
			11: [0.68148, 2.39562],
			12: [0.61166, 2.51459],
			13: [0.54413, 2.63447],
			14: [0.47929, 2.75449],
			15: [0.41753, 2.87381],
			16: [0.35918, 2.99160],
			17: [0.30461, 3.10700],
			18: [0.25409, 3.21917],
			19: [0.20790, 3.32728],
			20: [0.16625, 3.43042],
			21: [0.12931, 3.52786]
		},
		30: {
			2: [1.35204, 1.48936],
			3: [1.28373, 1.56661],
			4: [1.21380, 1.64981],
			5: [1.14262, 1.73860],
			6: [1.07060, 1.83259],
			7: [0.99815, 1.93133],
			8: [0.92564, 2.03432],
			9: [0.85351, 2.14102],
			10: [0.78217, 2.25080],
			11: [0.71202, 2.36307],
			12: [0.64345, 2.47714],
			13: [0.57685, 2.59233],
			14: [0.51259, 2.70793],
			15: [0.45105, 2.82319],
			16: [0.39255, 2.93738],
			17: [0.33740, 3.04971],
			18: [0.28590, 3.15946],
			19: [0.23830, 3.26584],
			20: [0.19485, 3.36811],
			21: [0.15572, 3.46549]
		},
		31: {
			2: [1.36298, 1.49574],
			3: [1.29685, 1.57011],
			4: [1.22915, 1.65002],
			5: [1.16021, 1.73518],
			6: [1.09040, 1.82522],
			7: [1.02008, 1.91976],
			8: [0.94962, 2.01834],
			9: [0.87940, 2.12046],
			10: [0.80979, 2.22562],
			11: [0.74115, 2.33323],
			12: [0.67387, 2.44273],
			13: [0.60828, 2.55347],
			14: [0.54474, 2.66484],
			15: [0.48358, 2.77618],
			16: [0.42513, 2.88680],
			17: [0.36966, 2.99604],
			18: [0.31748, 3.10322],
			19: [0.26882, 3.20762],
			20: [0.22392, 3.30859],
			21: [0.18298, 3.40545]
		},
		32: {
			2: [1.37340, 1.50190],
			3: [1.30932, 1.57358],
			4: [1.24371, 1.65046],
			5: [1.17688, 1.73226],
			6: [1.10916, 1.81867],
			7: [1.04088, 1.90931],
			8: [0.97239, 2.00381],
			9: [0.90401, 2.10171],
			10: [0.83609, 2.20255],
			11: [0.76897, 2.30583],
			12: [0.70299, 2.41102],
			13: [0.63847, 2.51758],
			14: [0.57573, 2.62493],
			15: [0.51510, 2.73248],
			16: [0.45685, 2.83963],
			17: [0.40129, 2.94576],
			18: [0.34866, 3.05028],
			19: [0.29923, 3.15253],
			20: [0.25319, 3.25193],
			21: [0.21078, 3.34784]
		},
		33: {
			2: [1.38335, 1.50784],
			3: [1.32119, 1.57703],
			4: [1.25756, 1.65110],
			5: [1.19272, 1.72978],
			6: [1.12698, 1.81282],
			7: [1.06065, 1.89986],
			8: [0.99402, 1.99057],
			9: [0.92743, 2.08455],
			10: [0.86115, 2.18137],
			11: [0.79554, 2.28061],
			12: [0.73086, 2.38177],
			13: [0.66745, 2.48437],
			14: [0.60559, 2.58789],
			15: [0.54558, 2.69181],
			16: [0.48769, 2.79558],
			17: [0.43219, 2.89865],
			18: [0.37933, 3.00046],
			19: [0.32935, 3.10046],
			20: [0.28246, 3.19808],
			21: [0.23887, 3.29275]
		},
		34: {
			2: [1.39285, 1.51358],
			3: [1.33251, 1.58045],
			4: [1.27074, 1.65189],
			5: [1.20779, 1.72770],
			6: [1.14393, 1.80758],
			7: [1.07944, 1.89129],
			8: [1.01462, 1.97849],
			9: [0.94973, 2.06882],
			10: [0.88506, 2.16190],
			11: [0.82091, 2.25735],
			12: [0.75755, 2.35473],
			13: [0.69527, 2.45359],
			14: [0.63433, 2.55348],
			15: [0.57503, 2.65392],
			16: [0.51760, 2.75442],
			17: [0.46231, 2.85449],
			18: [0.40939, 2.95361],
			19: [0.35907, 3.05127],
			20: [0.31155, 3.14697],
			21: [0.26704, 3.24020]
		},
		35: {
			2: [1.40194, 1.51914],
			3: [1.34332, 1.58382],
			4: [1.28330, 1.65282],
			5: [1.22214, 1.72593],
			6: [1.16007, 1.80292],
			7: [1.09735, 1.88351],
			8: [1.03424, 1.96743],
			9: [0.97099, 2.05436],
			10: [0.90788, 2.14395],
			11: [0.84516, 2.23585],
			12: [0.78311, 2.32966],
			13: [0.72197, 2.42501],
			14: [0.66200, 2.52146],
			15: [0.60346, 2.61858],
			16: [0.54659, 2.71593],
			17: [0.49162, 2.81306],
			18: [0.43878, 2.90951],
			19: [0.38829, 3.00481],
			20: [0.34034, 3.09851],
			21: [0.29513, 3.19013]
		},
		36: {
			2: [1.41065, 1.52451],
			3: [1.35365, 1.58716],
			4: [1.29530, 1.65387],
			5: [1.23583, 1.72447],
			6: [1.17545, 1.79873],
			7: [1.11441, 1.87643],
			8: [1.05294, 1.95730],
			9: [0.99128, 2.04104],
			10: [0.92967, 2.12737],
			11: [0.86836, 2.21594],
			12: [0.80759, 2.30642],
			13: [0.74759, 2.39844],
			14: [0.68861, 2.49162],
			15: [0.63089, 2.58557],
			16: [0.57463, 2.67990],
			17: [0.52008, 2.77418],
			18: [0.46745, 2.86800],
			19: [0.41692, 2.96095],
			20: [0.36871, 3.05259],
			21: [0.32299, 3.14249]
		},
		37: {
			2: [1.41900, 1.52971],
			3: [1.36354, 1.59044],
			4: [1.30678, 1.65501],
			5: [1.24891, 1.72327],
			6: [1.19014, 1.79499],
			7: [1.13071, 1.86998],
			8: [1.07081, 1.94799],
			9: [1.01066, 2.02876],
			10: [0.95051, 2.11203],
			11: [0.89057, 2.19749],
			12: [0.83105, 2.28481],
			13: [0.77219, 2.37369],
			14: [0.71421, 2.46378],
			15: [0.65734, 2.55471],
			16: [0.60177, 2.64613],
			17: [0.54771, 2.73765],
			18: [0.49537, 2.82891],
			19: [0.44494, 2.91951],
			20: [0.39661, 3.00907],
			21: [0.35054, 3.09719]
		},
		38: {
			2: [1.42702, 1.53475],
			3: [1.37301, 1.59368],
			4: [1.31774, 1.65625],
			5: [1.26140, 1.72229],
			6: [1.20418, 1.79164],
			7: [1.14627, 1.86409],
			8: [1.08787, 1.93942],
			9: [1.02919, 2.01742],
			10: [0.97045, 2.09782],
			11: [0.91183, 2.18033],
			12: [0.85356, 2.26470],
			13: [0.79583, 2.35061],
			14: [0.73886, 2.43775],
			15: [0.68284, 2.52581],
			16: [0.62799, 2.61444],
			17: [0.57448, 2.70332],
			18: [0.52253, 2.79207],
			19: [0.47229, 2.88036],
			20: [0.42396, 2.96784],
			21: [0.37769, 3.05412]
		},
		39: {
			2: [1.43473, 1.53963],
			3: [1.38210, 1.59686],
			4: [1.32827, 1.65754],
			5: [1.27338, 1.72152],
			6: [1.21761, 1.78863],
			7: [1.16116, 1.85870],
			8: [1.10419, 1.93153],
			9: [1.04692, 2.00692],
			10: [0.98953, 2.08460],
			11: [0.93220, 2.16437],
			12: [0.87514, 2.24594],
			13: [0.81853, 2.32904],
			14: [0.76257, 2.41340],
			15: [0.70743, 2.49872],
			16: [0.65333, 2.58469],
			17: [0.60044, 2.67100],
			18: [0.54891, 2.75733],
			19: [0.49896, 2.84336],
			20: [0.45072, 2.92876],
			21: [0.40437, 3.01320]
		},
		40: {
			2: [1.44214, 1.54436],
			3: [1.39083, 1.59999],
			4: [1.33835, 1.65889],
			5: [1.28484, 1.72092],
			6: [1.23047, 1.78594],
			7: [1.17541, 1.85378],
			8: [1.11983, 1.92426],
			9: [1.06391, 1.99717],
			10: [1.00782, 2.07233],
			11: [0.95174, 2.14950],
			12: [0.89585, 2.22843],
			13: [0.84035, 2.30888],
			14: [0.78539, 2.39060],
			15: [0.73115, 2.47330],
			16: [0.67782, 2.55672],
			17: [0.62556, 2.64056],
			18: [0.57454, 2.72455],
			19: [0.52492, 2.80836],
			20: [0.47687, 2.89172],
			21: [0.43054, 2.97431]
		},
		41: {
			2: [1.44927, 1.54895],
			3: [1.39922, 1.60307],
			4: [1.34803, 1.66028],
			5: [1.29584, 1.72048],
			6: [1.24280, 1.78353],
			7: [1.18907, 1.84926],
			8: [1.13481, 1.91753],
			9: [1.08019, 1.98813],
			10: [1.02536, 2.06089],
			11: [0.97050, 2.13561],
			12: [0.91576, 2.21204],
			13: [0.86132, 2.28998],
			14: [0.80736, 2.36919],
			15: [0.75402, 2.44941],
			16: [0.70146, 2.53039],
			17: [0.64987, 2.61187],
			18: [0.59940, 2.69358],
			19: [0.55018, 2.77525],
			20: [0.50238, 2.85660],
			21: [0.45615, 2.93734]
		},
		42: {
			2: [1.45615, 1.55340],
			3: [1.40730, 1.60608],
			4: [1.35733, 1.66172],
			5: [1.30640, 1.72019],
			6: [1.25463, 1.78137],
			7: [1.20218, 1.84512],
			8: [1.14918, 1.91130],
			9: [1.09581, 1.97972],
			10: [1.04219, 2.05023],
			11: [0.98851, 2.12262],
			12: [0.93489, 2.19670],
			13: [0.88151, 2.27227],
			14: [0.82852, 2.34909],
			15: [0.77607, 2.42694],
			16: [0.72431, 2.50558],
			17: [0.67341, 2.58480],
			18: [0.62350, 2.66432],
			19: [0.57474, 2.74389],
			20: [0.52726, 2.82328],
			21: [0.48121, 2.90220]
		},
		43: {
			2: [1.46278, 1.55773],
			3: [1.41507, 1.60905],
			4: [1.36629, 1.66319],
			5: [1.31655, 1.72002],
			6: [1.26600, 1.77944],
			7: [1.21476, 1.84132],
			8: [1.16298, 1.90552],
			9: [1.11080, 1.97189],
			10: [1.05837, 2.04027],
			11: [1.00581, 2.11047],
			12: [0.95328, 2.18231],
			13: [0.90093, 2.25562],
			14: [0.84891, 2.33017],
			15: [0.79734, 2.40577],
			16: [0.74639, 2.48220],
			17: [0.69619, 2.55922],
			18: [0.64688, 2.63664],
			19: [0.59860, 2.71419],
			20: [0.55149, 2.79164],
			21: [0.50568, 2.86878]
		},
		44: {
			2: [1.46920, 1.56193],
			3: [1.42257, 1.61196],
			4: [1.37490, 1.66467],
			5: [1.32631, 1.71996],
			6: [1.27692, 1.77772],
			7: [1.22685, 1.83784],
			8: [1.17624, 1.90017],
			9: [1.12522, 1.96460],
			10: [1.07390, 2.03095],
			11: [1.02245, 2.09907],
			12: [0.97099, 2.16881],
			13: [0.91964, 2.23997],
			14: [0.86856, 2.31237],
			15: [0.81787, 2.38581],
			16: [0.76771, 2.46011],
			17: [0.71822, 2.53505],
			18: [0.66953, 2.61043],
			19: [0.62177, 2.68601],
			20: [0.57507, 2.76161],
			21: [0.52954, 2.83698]
		},
		45: {
			2: [1.47538, 1.56602],
			3: [1.42980, 1.61482],
			4: [1.38320, 1.66618],
			5: [1.33571, 1.71999],
			6: [1.28744, 1.77618],
			7: [1.23849, 1.83462],
			8: [1.18899, 1.89520],
			9: [1.13907, 1.95778],
			10: [1.08886, 2.02222],
			11: [1.03846, 2.08839],
			12: [0.98802, 2.15611],
			13: [0.93765, 2.22524],
			14: [0.88750, 2.29558],
			15: [0.83769, 2.36698],
			16: [0.78833, 2.43924],
			17: [0.73955, 2.51218],
			18: [0.69149, 2.58559],
			19: [0.64427, 2.65929],
			20: [0.59801, 2.73306],
			21: [0.55282, 2.80672]
		},
		46: {
			2: [1.48136, 1.56999],
			3: [1.43677, 1.61763],
			4: [1.39121, 1.66769],
			5: [1.34477, 1.72012],
			6: [1.29756, 1.77482],
			7: [1.24969, 1.83167],
			8: [1.20127, 1.89058],
			9: [1.15242, 1.95141],
			10: [1.10325, 2.01404],
			11: [1.05388, 2.07834],
			12: [1.00443, 2.14416],
			13: [0.95503, 2.21134],
			14: [0.90578, 2.27974],
			15: [0.85681, 2.34918],
			16: [0.80825, 2.41950],
			17: [0.76020, 2.49051],
			18: [0.71278, 2.56205],
			19: [0.66611, 2.63391],
			20: [0.62032, 2.70593],
			21: [0.57550, 2.77790]
		},
		47: {
			2: [1.48715, 1.57386],
			3: [1.44352, 1.62038],
			4: [1.39894, 1.66923],
			5: [1.35350, 1.72033],
			6: [1.30731, 1.77361],
			7: [1.26047, 1.82895],
			8: [1.21309, 1.88627],
			9: [1.16526, 1.94545],
			10: [1.11710, 2.00636],
			11: [1.06873, 2.06889],
			12: [1.02026, 2.13290],
			13: [0.97178, 2.19824],
			14: [0.92342, 2.26478],
			15: [0.87529, 2.33235],
			16: [0.82751, 2.40080],
			17: [0.78018, 2.46998],
			18: [0.73341, 2.53970],
			19: [0.68732, 2.60980],
			20: [0.64200, 2.68011],
			21: [0.59759, 2.75044]
		},
		48: {
			2: [1.49275, 1.57762],
			3: [1.45004, 1.62308],
			4: [1.40640, 1.67076],
			5: [1.36192, 1.72061],
			6: [1.31672, 1.77253],
			7: [1.27087, 1.82645],
			8: [1.22447, 1.88226],
			9: [1.17764, 1.93987],
			10: [1.13046, 1.99915],
			11: [1.08306, 2.05999],
			12: [1.03552, 2.12227],
			13: [0.98794, 2.18586],
			14: [0.94045, 2.25062],
			15: [0.89314, 2.31641],
			16: [0.84614, 2.38309],
			17: [0.79951, 2.45049],
			18: [0.75340, 2.51847],
			19: [0.70789, 2.58687],
			20: [0.66309, 2.65552],
			21: [0.61909, 2.72427]
		},
		49: {
			2: [1.49819, 1.58129],
			3: [1.45635, 1.62573],
			4: [1.41362, 1.67230],
			5: [1.37007, 1.72095],
			6: [1.32580, 1.77159],
			7: [1.28090, 1.82415],
			8: [1.23546, 1.87852],
			9: [1.18958, 1.93463],
			10: [1.14336, 1.99236],
			11: [1.09687, 2.05160],
			12: [1.05024, 2.11224],
			13: [1.00354, 2.17415],
			14: [0.95690, 2.23723],
			15: [0.91040, 2.30131],
			16: [0.86415, 2.36628],
			17: [0.81824, 2.43199],
			18: [0.77278, 2.49829],
			19: [0.72786, 2.56505],
			20: [0.68358, 2.63211],
			21: [0.64003, 2.69930]
		},
		50: {
			2: [1.50345, 1.58486],
			3: [1.46246, 1.62833],
			4: [1.42059, 1.67385],
			5: [1.37793, 1.72135],
			6: [1.33457, 1.77077],
			7: [1.29059, 1.82203],
			8: [1.24607, 1.87504],
			9: [1.20110, 1.92972],
			10: [1.15579, 1.98597],
			11: [1.11021, 2.04368],
			12: [1.06445, 2.10276],
			13: [1.01862, 2.16307],
			14: [0.97280, 2.22452],
			15: [0.92709, 2.28698],
			16: [0.88159, 2.35032],
			17: [0.83638, 2.41440],
			18: [0.79156, 2.47910],
			19: [0.74723, 2.54428],
			20: [0.70348, 2.60978],
			21: [0.66040, 2.67548]
		},
		51: {
			2: [1.50856, 1.58835],
			3: [1.46838, 1.63088],
			4: [1.42734, 1.67538],
			5: [1.38554, 1.72179],
			6: [1.34305, 1.77005],
			7: [1.29995, 1.82007],
			8: [1.25632, 1.87178],
			9: [1.21224, 1.92510],
			10: [1.16780, 1.97994],
			11: [1.12308, 2.03620],
			12: [1.07818, 2.09378],
			13: [1.03319, 2.15258],
			14: [0.98817, 2.21249],
			15: [0.94324, 2.27338],
			16: [0.89847, 2.33515],
			17: [0.85396, 2.39767],
			18: [0.80978, 2.46083],
			19: [0.76604, 2.52448],
			20: [0.72282, 2.58848],
			21: [0.68021, 2.65272]
		},
		52: {
			2: [1.51352, 1.59174],
			3: [1.47410, 1.63339],
			4: [1.43388, 1.67692],
			5: [1.39290, 1.72228],
			6: [1.35124, 1.76942],
			7: [1.30899, 1.81827],
			8: [1.26622, 1.86874],
			9: [1.22299, 1.92076],
			10: [1.17941, 1.97426],
			11: [1.13553, 2.02913],
			12: [1.09146, 2.08528],
			13: [1.04727, 2.14263],
			14: [1.00304, 2.20106],
			15: [0.95887, 2.26046],
			16: [0.91481, 2.32074],
			17: [0.87099, 2.38176],
			18: [0.82745, 2.44341],
			19: [0.78431, 2.50559],
			20: [0.74163, 2.56816],
			21: [0.69949, 2.63099]
		},
		53: {
			2: [1.51833, 1.59505],
			3: [1.47967, 1.63585],
			4: [1.44022, 1.67845],
			5: [1.40002, 1.72282],
			6: [1.35918, 1.76890],
			7: [1.31774, 1.81661],
			8: [1.27579, 1.86590],
			9: [1.23340, 1.91668],
			10: [1.19063, 1.96889],
			11: [1.14757, 2.02244],
			12: [1.10430, 2.07723],
			13: [1.06090, 2.13318],
			14: [1.01743, 2.19019],
			15: [0.97399, 2.24817],
			16: [0.93065, 2.30700],
			17: [0.88749, 2.36659],
			18: [0.84459, 2.42682],
			19: [0.80204, 2.48757],
			20: [0.75990, 2.54874],
			21: [0.71826, 2.61021]
		},
		54: {
			2: [1.52300, 1.59829],
			3: [1.48506, 1.63825],
			4: [1.44636, 1.67998],
			5: [1.40693, 1.72339],
			6: [1.36687, 1.76844],
			7: [1.32622, 1.81508],
			8: [1.28506, 1.86324],
			9: [1.24345, 1.91283],
			10: [1.20149, 1.96381],
			11: [1.15921, 2.01609],
			12: [1.11672, 2.06959],
			13: [1.07408, 2.12420],
			14: [1.03136, 2.17987],
			15: [0.98864, 2.23647],
			16: [0.94600, 2.29392],
			17: [0.90349, 2.35213],
			18: [0.86122, 2.41097],
			19: [0.81925, 2.47036],
			20: [0.77766, 2.53019],
			21: [0.73651, 2.59033]
		},
		55: {
			2: [1.52755, 1.60144],
			3: [1.49031, 1.64062],
			4: [1.45232, 1.68149],
			5: [1.41362, 1.72399],
			6: [1.37431, 1.76807],
			7: [1.33442, 1.81368],
			8: [1.29403, 1.86074],
			9: [1.25319, 1.90921],
			10: [1.21199, 1.95902],
			11: [1.17049, 2.01008],
			12: [1.12875, 2.06233],
			13: [1.08685, 2.11568],
			14: [1.04485, 2.17003],
			15: [1.00284, 2.22532],
			16: [0.96087, 2.28146],
			17: [0.91902, 2.33833],
			18: [0.87736, 2.39585],
			19: [0.83597, 2.45392],
			20: [0.79492, 2.51244],
			21: [0.75427, 2.57131]
		},
		56: {
			2: [1.53197, 1.60452],
			3: [1.49541, 1.64295],
			4: [1.45810, 1.68300],
			5: [1.42012, 1.72461],
			6: [1.38152, 1.76776],
			7: [1.34237, 1.81238],
			8: [1.30271, 1.85841],
			9: [1.26263, 1.90579],
			10: [1.22217, 1.95448],
			11: [1.18141, 2.00438],
			12: [1.14040, 2.05542],
			13: [1.09922, 2.10755],
			14: [1.05793, 2.16067],
			15: [1.01659, 2.21470],
			16: [0.97530, 2.26956],
			17: [0.93408, 2.32515],
			18: [0.89304, 2.38140],
			19: [0.85222, 2.43820],
			20: [0.81170, 2.49546],
			21: [0.77155, 2.55309]
		},
		57: {
			2: [1.53628, 1.60754],
			3: [1.50036, 1.64524],
			4: [1.46372, 1.68449],
			5: [1.42642, 1.72526],
			6: [1.38852, 1.76751],
			7: [1.35008, 1.81119],
			8: [1.31114, 1.85622],
			9: [1.27177, 1.90257],
			10: [1.23203, 1.95018],
			11: [1.19198, 1.99896],
			12: [1.15168, 2.04887],
			13: [1.11121, 2.09982],
			14: [1.07060, 2.15175],
			15: [1.02994, 2.20456],
			16: [0.98929, 2.25820],
			17: [0.94871, 2.31257],
			18: [0.90825, 2.36758],
			19: [0.86800, 2.42316],
			20: [0.82802, 2.47920],
			21: [0.78836, 2.53563]
		},
		58: {
			2: [1.54047, 1.61048],
			3: [1.50517, 1.64747],
			4: [1.46918, 1.68598],
			5: [1.43254, 1.72594],
			6: [1.39532, 1.76733],
			7: [1.35755, 1.81009],
			8: [1.31931, 1.85418],
			9: [1.28063, 1.89954],
			10: [1.24159, 1.94610],
			11: [1.20224, 1.99382],
			12: [1.16263, 2.04262],
			13: [1.12283, 2.09245],
			14: [1.08289, 2.14323],
			15: [1.04288, 2.19489],
			16: [1.00287, 2.24735],
			17: [0.96289, 2.30054],
			18: [0.92304, 2.35436],
			19: [0.88335, 2.40875],
			20: [0.84389, 2.46362],
			21: [0.80473, 2.51889]
		},
		59: {
			2: [1.54455, 1.61336],
			3: [1.50985, 1.64967],
			4: [1.47448, 1.68745],
			5: [1.43848, 1.72663],
			6: [1.40191, 1.76720],
			7: [1.36481, 1.80908],
			8: [1.32723, 1.85226],
			9: [1.28923, 1.89665],
			10: [1.25086, 1.94223],
			11: [1.21218, 1.98893],
			12: [1.17325, 2.03668],
			13: [1.13410, 2.08543],
			14: [1.09482, 2.13510],
			15: [1.05545, 2.18564],
			16: [1.01605, 2.23698],
			17: [0.97668, 2.28902],
			18: [0.93739, 2.34171],
			19: [0.89826, 2.39495],
			20: [0.85932, 2.44869],
			21: [0.82065, 2.50283]
		},
		60: {
			2: [1.54853, 1.61617],
			3: [1.51442, 1.65184],
			4: [1.47965, 1.68891],
			5: [1.44427, 1.72735],
			6: [1.40832, 1.76711],
			7: [1.37186, 1.80817],
			8: [1.33493, 1.85045],
			9: [1.29758, 1.89393],
			10: [1.25987, 1.93856],
			11: [1.22183, 1.98427],
			12: [1.18354, 2.03101],
			13: [1.14505, 2.07873],
			14: [1.10640, 2.12734],
			15: [1.06764, 2.17681],
			16: [1.02885, 2.22705],
			17: [0.99007, 2.27800],
			18: [0.95135, 2.32958],
			19: [0.91276, 2.38173],
			20: [0.87435, 2.43437],
			21: [0.83616, 2.48742]
		},
		61: {
			2: [1.55240, 1.61892],
			3: [1.51886, 1.65396],
			4: [1.48468, 1.69035],
			5: [1.44989, 1.72808],
			6: [1.41455, 1.76708],
			7: [1.37871, 1.80732],
			8: [1.34240, 1.84876],
			9: [1.30568, 1.89137],
			10: [1.26860, 1.93507],
			11: [1.23120, 1.97984],
			12: [1.19355, 2.02560],
			13: [1.15567, 2.07232],
			14: [1.11763, 2.11992],
			15: [1.07950, 2.16835],
			16: [1.04129, 2.21755],
			17: [1.00309, 2.26744],
			18: [0.96492, 2.31796],
			19: [0.92686, 2.36904],
			20: [0.88896, 2.42062],
			21: [0.85126, 2.47262]
		},
		62: {
			2: [1.55619, 1.62161],
			3: [1.52318, 1.65605],
			4: [1.48957, 1.69180],
			5: [1.45536, 1.72881],
			6: [1.42061, 1.76708],
			7: [1.38536, 1.80655],
			8: [1.34967, 1.84718],
			9: [1.31356, 1.88893],
			10: [1.27709, 1.93176],
			11: [1.24031, 1.97561],
			12: [1.20326, 2.02044],
			13: [1.16599, 2.06620],
			14: [1.12856, 2.11282],
			15: [1.09100, 2.16026],
			16: [1.05338, 2.20844],
			17: [1.01573, 2.25732],
			18: [0.97812, 2.30681],
			19: [0.94058, 2.35687],
			20: [0.90319, 2.40742],
			21: [0.86597, 2.45840]
		},
		63: {
			2: [1.55987, 1.62425],
			3: [1.52741, 1.65810],
			4: [1.49433, 1.69321],
			5: [1.46068, 1.72957],
			6: [1.42650, 1.76712],
			7: [1.39183, 1.80584],
			8: [1.35672, 1.84569],
			9: [1.32121, 1.88663],
			10: [1.28534, 1.92860],
			11: [1.24915, 1.97159],
			12: [1.21269, 2.01552],
			13: [1.17602, 2.06035],
			14: [1.13917, 2.10603],
			15: [1.10219, 2.15250],
			16: [1.06512, 2.19971],
			17: [1.02803, 2.24761],
			18: [0.99096, 2.29612],
			19: [0.95394, 2.34518],
			20: [0.91703, 2.39474],
			21: [0.88029, 2.44473]
		},
		64: {
			2: [1.56348, 1.62683],
			3: [1.53152, 1.66011],
			4: [1.49897, 1.69463],
			5: [1.46587, 1.73033],
			6: [1.43223, 1.76720],
			7: [1.39813, 1.80520],
			8: [1.36359, 1.84429],
			9: [1.32865, 1.88444],
			10: [1.29336, 1.92561],
			11: [1.25775, 1.96775],
			12: [1.22188, 2.01081],
			13: [1.18576, 2.05475],
			14: [1.14949, 2.09952],
			15: [1.11306, 2.14507],
			16: [1.07655, 2.19134],
			17: [1.04000, 2.23829],
			18: [1.00345, 2.28584],
			19: [0.96694, 2.33395],
			20: [0.93053, 2.38255],
			21: [0.89425, 2.43159]
		},
		65: {
			2: [1.56699, 1.62936],
			3: [1.53553, 1.66210],
			4: [1.50349, 1.69602],
			5: [1.47092, 1.73110],
			6: [1.43782, 1.76731],
			7: [1.40426, 1.80462],
			8: [1.37027, 1.84298],
			9: [1.33589, 1.88238],
			10: [1.30115, 1.92276],
			11: [1.26611, 1.96408],
			12: [1.23080, 2.00631],
			13: [1.19525, 2.04939],
			14: [1.15952, 2.09329],
			15: [1.12364, 2.13795],
			16: [1.08767, 2.18331],
			17: [1.05165, 2.22934],
			18: [1.01560, 2.27597],
			19: [0.97960, 2.32315],
			20: [0.94367, 2.37083],
			21: [0.90785, 2.41894]
		},
		66: {
			2: [1.57043, 1.63184],
			3: [1.53945, 1.66404],
			4: [1.50790, 1.69740],
			5: [1.47583, 1.73188],
			6: [1.44326, 1.76745],
			7: [1.41023, 1.80409],
			8: [1.37677, 1.84175],
			9: [1.34293, 1.88041],
			10: [1.30874, 1.92004],
			11: [1.27424, 1.96058],
			12: [1.23947, 2.00200],
			13: [1.20447, 2.04426],
			14: [1.16928, 2.08731],
			15: [1.13394, 2.13110],
			16: [1.09850, 2.17559],
			17: [1.06298, 2.22074],
			18: [1.02744, 2.26648],
			19: [0.99192, 2.31277],
			20: [0.95646, 2.35954],
			21: [0.92111, 2.40676]
		},
		67: {
			2: [1.57378, 1.63427],
			3: [1.54328, 1.66596],
			4: [1.51221, 1.69877],
			5: [1.48063, 1.73267],
			6: [1.44856, 1.76762],
			7: [1.41604, 1.80360],
			8: [1.38311, 1.84060],
			9: [1.34979, 1.87856],
			10: [1.31613, 1.91744],
			11: [1.28216, 1.95723],
			12: [1.24792, 1.99787],
			13: [1.21345, 2.03934],
			14: [1.17878, 2.08158],
			15: [1.14396, 2.12453],
			16: [1.10903, 2.16819],
			17: [1.07401, 2.21248],
			18: [1.03897, 2.25735],
			19: [1.00394, 2.30277],
			20: [0.96894, 2.34868],
			21: [0.93402, 2.39503]
		},
		68: {
			2: [1.57706, 1.63665],
			3: [1.54701, 1.66784],
			4: [1.51642, 1.70011],
			5: [1.48531, 1.73345],
			6: [1.45373, 1.76781],
			7: [1.42171, 1.80318],
			8: [1.38928, 1.83952],
			9: [1.35647, 1.87679],
			10: [1.32332, 1.91497],
			11: [1.28987, 1.95403],
			12: [1.25614, 1.99393],
			13: [1.22218, 2.03462],
			14: [1.18803, 2.07606],
			15: [1.15372, 2.11823],
			16: [1.11929, 2.16106],
			17: [1.08477, 2.20453],
			18: [1.05021, 2.24857],
			19: [1.01563, 2.29315],
			20: [0.98109, 2.33822],
			21: [0.94663, 2.38371]
		},
		69: {
			2: [1.58027, 1.63898],
			3: [1.55066, 1.66970],
			4: [1.52052, 1.70146],
			5: [1.48988, 1.73425],
			6: [1.45877, 1.76803],
			7: [1.42723, 1.80279],
			8: [1.39529, 1.83849],
			9: [1.36298, 1.87512],
			10: [1.33032, 1.91262],
			11: [1.29737, 1.95098],
			12: [1.26415, 1.99014],
			13: [1.23069, 2.03009],
			14: [1.19704, 2.07078],
			15: [1.16322, 2.11216],
			16: [1.12928, 2.15421],
			17: [1.09524, 2.19688],
			18: [1.06115, 2.24012],
			19: [1.02704, 2.28388],
			20: [0.99295, 2.32813],
			21: [0.95892, 2.37281]
		},
		70: {
			2: [1.58341, 1.64127],
			3: [1.55422, 1.67152],
			4: [1.52452, 1.70278],
			5: [1.49434, 1.73505],
			6: [1.46369, 1.76827],
			7: [1.43262, 1.80245],
			8: [1.40115, 1.83754],
			9: [1.36932, 1.87353],
			10: [1.33716, 1.91037],
			11: [1.30469, 1.94805],
			12: [1.27196, 1.98652],
			13: [1.23899, 2.02574],
			14: [1.20582, 2.06569],
			15: [1.17249, 2.10634],
			16: [1.13902, 2.14762],
			17: [1.10544, 2.18951],
			18: [1.07182, 2.23197],
			19: [1.03816, 2.27495],
			20: [1.00451, 2.31840],
			21: [0.97091, 2.36230]
		},
		71: {
			2: [1.58648, 1.64352],
			3: [1.55771, 1.67331],
			4: [1.52844, 1.70409],
			5: [1.49868, 1.73584],
			6: [1.46849, 1.76854],
			7: [1.43787, 1.80214],
			8: [1.40686, 1.83664],
			9: [1.37551, 1.87202],
			10: [1.34381, 1.90823],
			11: [1.31182, 1.94524],
			12: [1.27957, 1.98304],
			13: [1.24707, 2.02157],
			14: [1.21437, 2.06081],
			15: [1.18150, 2.10073],
			16: [1.14851, 2.14128],
			17: [1.11539, 2.18242],
			18: [1.08222, 2.22412],
			19: [1.04900, 2.26634],
			20: [1.01579, 2.30903],
			21: [0.98261, 2.35215]
		},
		72: {
			2: [1.58949, 1.64571],
			3: [1.56112, 1.67507],
			4: [1.53226, 1.70539],
			5: [1.50293, 1.73664],
			6: [1.47317, 1.76881],
			7: [1.44300, 1.80187],
			8: [1.41245, 1.83581],
			9: [1.38154, 1.87059],
			10: [1.35030, 1.90618],
			11: [1.31877, 1.94256],
			12: [1.28698, 1.97970],
			13: [1.25495, 2.01756],
			14: [1.22272, 2.05611],
			15: [1.19031, 2.09532],
			16: [1.15776, 2.13516],
			17: [1.12510, 2.17558],
			18: [1.09237, 2.21655],
			19: [1.05959, 2.25803],
			20: [1.02680, 2.29997],
			21: [0.99403, 2.34236]
		},
		73: {
			2: [1.59243, 1.64788],
			3: [1.56446, 1.67681],
			4: [1.53599, 1.70667],
			5: [1.50709, 1.73745],
			6: [1.47775, 1.76911],
			7: [1.44801, 1.80164],
			8: [1.41789, 1.83502],
			9: [1.38743, 1.86923],
			10: [1.35663, 1.90422],
			11: [1.32556, 1.93999],
			12: [1.29421, 1.97649],
			13: [1.26262, 2.01370],
			14: [1.23084, 2.05159],
			15: [1.19889, 2.09013],
			16: [1.16678, 2.12927],
			17: [1.13456, 2.16899],
			18: [1.10226, 2.20925],
			19: [1.06991, 2.25001],
			20: [1.03753, 2.29124],
			21: [1.00517, 2.33290]
		},
		74: {
			2: [1.59530, 1.65001],
			3: [1.56772, 1.67852],
			4: [1.53966, 1.70793],
			5: [1.51115, 1.73825],
			6: [1.48222, 1.76943],
			7: [1.45289, 1.80144],
			8: [1.42321, 1.83429],
			9: [1.39316, 1.86793],
			10: [1.36281, 1.90235],
			11: [1.33217, 1.93752],
			12: [1.30127, 1.97341],
			13: [1.27013, 2.01000],
			14: [1.23878, 2.04724],
			15: [1.20725, 2.08511],
			16: [1.17559, 2.12359],
			17: [1.14379, 2.16263],
			18: [1.11192, 2.20220],
			19: [1.07998, 2.24227],
			20: [1.04801, 2.28280],
			21: [1.01605, 2.32375]
		},
		75: {
			2: [1.59813, 1.65209],
			3: [1.57091, 1.68020],
			4: [1.54323, 1.70920],
			5: [1.51511, 1.73904],
			6: [1.48659, 1.76975],
			7: [1.45767, 1.80127],
			8: [1.42840, 1.83360],
			9: [1.39877, 1.86670],
			10: [1.36884, 1.90057],
			11: [1.33863, 1.93516],
			12: [1.30815, 1.97046],
			13: [1.27744, 2.00643],
			14: [1.24652, 2.04304],
			15: [1.21542, 2.08028],
			16: [1.18418, 2.11811],
			17: [1.15281, 2.15649],
			18: [1.12135, 2.19540],
			19: [1.08982, 2.23480],
			20: [1.05825, 2.27465],
			21: [1.02668, 2.31492]
		},
		76: {
			2: [1.60090, 1.65413],
			3: [1.57404, 1.68185],
			4: [1.54673, 1.71043],
			5: [1.51900, 1.73985],
			6: [1.49086, 1.77009],
			7: [1.46233, 1.80113],
			8: [1.43346, 1.83295],
			9: [1.40425, 1.86553],
			10: [1.37473, 1.89886],
			11: [1.34493, 1.93288],
			12: [1.31488, 1.96761],
			13: [1.28458, 2.00299],
			14: [1.25408, 2.03900],
			15: [1.22340, 2.07563],
			16: [1.19257, 2.11283],
			17: [1.16161, 2.15057],
			18: [1.13056, 2.18883],
			19: [1.09942, 2.22757],
			20: [1.06825, 2.26676],
			21: [1.03706, 2.30638]
		},
		77: {
			2: [1.60361, 1.65614],
			3: [1.57710, 1.68348],
			4: [1.55015, 1.71166],
			5: [1.52279, 1.74065],
			6: [1.49503, 1.77044],
			7: [1.46690, 1.80102],
			8: [1.43842, 1.83235],
			9: [1.40961, 1.86443],
			10: [1.38048, 1.89722],
			11: [1.35108, 1.93071],
			12: [1.32143, 1.96487],
			13: [1.29155, 1.99969],
			14: [1.26146, 2.03511],
			15: [1.23119, 2.07113],
			16: [1.20076, 2.10772],
			17: [1.17020, 2.14485],
			18: [1.13954, 2.18248],
			19: [1.10881, 2.22059],
			20: [1.07801, 2.25914],
			21: [1.04721, 2.29811]
		},
		78: {
			2: [1.60626, 1.65812],
			3: [1.58010, 1.68509],
			4: [1.55351, 1.71287],
			5: [1.52651, 1.74145],
			6: [1.49912, 1.77081],
			7: [1.47136, 1.80093],
			8: [1.44325, 1.83178],
			9: [1.41483, 1.86337],
			10: [1.38610, 1.89565],
			11: [1.35711, 1.92862],
			12: [1.32785, 1.96224],
			13: [1.29836, 1.99650],
			14: [1.26867, 2.03136],
			15: [1.23879, 2.06680],
			16: [1.20876, 2.10279],
			17: [1.17860, 2.13932],
			18: [1.14832, 2.17634],
			19: [1.11797, 2.21384],
			20: [1.08756, 2.25177],
			21: [1.05712, 2.29011]
		},
		79: {
			2: [1.60887, 1.66006],
			3: [1.58304, 1.68667],
			4: [1.55679, 1.71407],
			5: [1.53015, 1.74225],
			6: [1.50312, 1.77118],
			7: [1.47572, 1.80086],
			8: [1.44800, 1.83126],
			9: [1.41994, 1.86237],
			10: [1.39160, 1.89416],
			11: [1.36299, 1.92661],
			12: [1.33411, 1.95970],
			13: [1.30501, 1.99342],
			14: [1.27571, 2.02773],
			15: [1.24622, 2.06261],
			16: [1.21658, 2.09804],
			17: [1.18679, 2.13398],
			18: [1.15690, 2.17041],
			19: [1.12693, 2.20730],
			20: [1.09689, 2.24464],
			21: [1.06680, 2.28237]
		},
		80: {
			2: [1.61143, 1.66197],
			3: [1.58592, 1.68823],
			4: [1.56001, 1.71526],
			5: [1.53370, 1.74304],
			6: [1.50703, 1.77156],
			7: [1.47999, 1.80081],
			8: [1.45262, 1.83077],
			9: [1.42495, 1.86142],
			10: [1.39698, 1.89272],
			11: [1.36873, 1.92469],
			12: [1.34024, 1.95727],
			13: [1.31151, 1.99046],
			14: [1.28259, 2.02423],
			15: [1.25348, 2.05857],
			16: [1.22422, 2.09343],
			17: [1.19481, 2.12881],
			18: [1.16529, 2.16467],
			19: [1.13568, 2.20099],
			20: [1.10600, 2.23772],
			21: [1.07628, 2.27487]
		},
		81: {
			2: [1.61393, 1.66385],
			3: [1.58875, 1.68976],
			4: [1.56316, 1.71643],
			5: [1.53719, 1.74384],
			6: [1.51085, 1.77196],
			7: [1.48417, 1.80079],
			8: [1.45715, 1.83031],
			9: [1.42984, 1.86051],
			10: [1.40223, 1.89135],
			11: [1.37434, 1.92282],
			12: [1.34622, 1.95492],
			13: [1.31787, 1.98760],
			14: [1.28931, 2.02085],
			15: [1.26058, 2.05466],
			16: [1.23168, 2.08898],
			17: [1.20264, 2.12381],
			18: [1.17348, 2.15911],
			19: [1.14424, 2.19486],
			20: [1.11491, 2.23103],
			21: [1.08555, 2.26760]
		},
		82: {
			2: [1.61639, 1.66569],
			3: [1.59152, 1.69128],
			4: [1.56625, 1.71759],
			5: [1.54060, 1.74462],
			6: [1.51461, 1.77237],
			7: [1.48826, 1.80079],
			8: [1.46159, 1.82989],
			9: [1.43462, 1.85964],
			10: [1.40736, 1.89003],
			11: [1.37984, 1.92105],
			12: [1.35207, 1.95265],
			13: [1.32408, 1.98485],
			14: [1.29590, 2.01760],
			15: [1.26752, 2.05088],
			16: [1.23898, 2.08469],
			17: [1.21030, 2.11897],
			18: [1.18150, 2.15373],
			19: [1.15260, 2.18894],
			20: [1.12364, 2.22455],
			21: [1.09461, 2.26056]
		},
		83: {
			2: [1.61880, 1.66751],
			3: [1.59423, 1.69276],
			4: [1.56928, 1.71874],
			5: [1.54395, 1.74541],
			6: [1.51828, 1.77278],
			7: [1.49226, 1.80080],
			8: [1.46593, 1.82950],
			9: [1.43930, 1.85882],
			10: [1.41239, 1.88877],
			11: [1.38522, 1.91933],
			12: [1.35780, 1.95048],
			13: [1.33017, 1.98219],
			14: [1.30233, 2.01444],
			15: [1.27430, 2.04723],
			16: [1.24612, 2.08052],
			17: [1.21779, 2.11429],
			18: [1.18934, 2.14853],
			19: [1.16080, 2.18320],
			20: [1.13217, 2.21827],
			21: [1.10349, 2.25373]
		},
		84: {
			2: [1.62118, 1.66929],
			3: [1.59691, 1.69424],
			4: [1.57225, 1.71987],
			5: [1.54723, 1.74619],
			6: [1.52188, 1.77318],
			7: [1.49618, 1.80084],
			8: [1.47018, 1.82912],
			9: [1.44388, 1.85804],
			10: [1.41731, 1.88756],
			11: [1.39048, 1.91768],
			12: [1.36340, 1.94837],
			13: [1.33611, 1.97962],
			14: [1.30862, 2.01140],
			15: [1.28094, 2.04370],
			16: [1.25310, 2.07649],
			17: [1.22512, 2.10976],
			18: [1.19701, 2.14348],
			19: [1.16880, 2.17762],
			20: [1.14051, 2.21218],
			21: [1.11215, 2.24712]
		},
		85: {
			2: [1.62350, 1.67105],
			3: [1.59952, 1.69568],
			4: [1.57516, 1.72100],
			5: [1.55045, 1.74697],
			6: [1.52540, 1.77361],
			7: [1.50003, 1.80089],
			8: [1.47434, 1.82879],
			9: [1.44837, 1.85730],
			10: [1.42212, 1.88641],
			11: [1.39562, 1.91610],
			12: [1.36889, 1.94635],
			13: [1.34194, 1.97714],
			14: [1.31477, 2.00845],
			15: [1.28744, 2.04028],
			16: [1.25993, 2.07259],
			17: [1.23229, 2.10536],
			18: [1.20451, 2.13858],
			19: [1.17664, 2.17223],
			20: [1.14868, 2.20627],
			21: [1.12064, 2.24070]
		},
		86: {
			2: [1.62579, 1.67277],
			3: [1.60209, 1.69711],
			4: [1.57802, 1.72210],
			5: [1.55360, 1.74775],
			6: [1.52885, 1.77404],
			7: [1.50378, 1.80095],
			8: [1.47842, 1.82848],
			9: [1.45277, 1.85659],
			10: [1.42684, 1.88530],
			11: [1.40066, 1.91457],
			12: [1.37426, 1.94439],
			13: [1.34762, 1.97474],
			14: [1.32081, 2.00561],
			15: [1.29379, 2.03697],
			16: [1.26662, 2.06881],
			17: [1.23931, 2.10111],
			18: [1.21187, 2.13384],
			19: [1.18432, 2.16700],
			20: [1.15667, 2.20054],
			21: [1.12896, 2.23446]
		},
		87: {
			2: [1.62804, 1.67448],
			3: [1.60461, 1.69851],
			4: [1.58083, 1.72320],
			5: [1.55670, 1.74852],
			6: [1.53224, 1.77448],
			7: [1.50748, 1.80103],
			8: [1.48242, 1.82819],
			9: [1.45707, 1.85592],
			10: [1.43146, 1.88423],
			11: [1.40561, 1.91310],
			12: [1.37951, 1.94250],
			13: [1.35320, 1.97243],
			14: [1.32671, 2.00285],
			15: [1.30002, 2.03377],
			16: [1.27317, 2.06515],
			17: [1.24617, 2.09699],
			18: [1.21906, 2.12925],
			19: [1.19183, 2.16192],
			20: [1.16450, 2.19498],
			21: [1.13710, 2.22841]
		},
		88: {
			2: [1.63024, 1.67615],
			3: [1.60709, 1.69990],
			4: [1.58358, 1.72429],
			5: [1.55974, 1.74929],
			6: [1.53557, 1.77491],
			7: [1.51109, 1.80112],
			8: [1.48633, 1.82792],
			9: [1.46129, 1.85529],
			10: [1.43599, 1.88321],
			11: [1.41044, 1.91168],
			12: [1.38466, 1.94068],
			13: [1.35867, 1.97019],
			14: [1.33248, 2.00018],
			15: [1.30611, 2.03067],
			16: [1.27958, 2.06160],
			17: [1.25290, 2.09298],
			18: [1.22609, 2.12478],
			19: [1.19918, 2.15699],
			20: [1.17217, 2.18959],
			21: [1.14507, 2.22254]
		},
		89: {
			2: [1.63242, 1.67780],
			3: [1.60951, 1.70127],
			4: [1.58628, 1.72536],
			5: [1.56271, 1.75006],
			6: [1.53883, 1.77535],
			7: [1.51465, 1.80123],
			8: [1.49017, 1.82768],
			9: [1.46542, 1.85469],
			10: [1.44042, 1.88223],
			11: [1.41518, 1.91032],
			12: [1.38970, 1.93892],
			13: [1.36402, 1.96802],
			14: [1.33814, 1.99760],
			15: [1.31208, 2.02766],
			16: [1.28585, 2.05816],
			17: [1.25949, 2.08910],
			18: [1.23299, 2.12046],
			19: [1.20638, 2.15221],
			20: [1.17967, 2.18434],
			21: [1.15289, 2.21683]
		},
		90: {
			2: [1.63454, 1.67942],
			3: [1.61190, 1.70262],
			4: [1.58893, 1.72642],
			5: [1.56564, 1.75082],
			6: [1.54202, 1.77580],
			7: [1.51812, 1.80135],
			8: [1.49393, 1.82745],
			9: [1.46947, 1.85411],
			10: [1.44476, 1.88129],
			11: [1.41982, 1.90900],
			12: [1.39464, 1.93721],
			13: [1.36926, 1.96592],
			14: [1.34368, 1.99510],
			15: [1.31792, 2.02474],
			16: [1.29200, 2.05483],
			17: [1.26594, 2.08533],
			18: [1.23974, 2.11626],
			19: [1.21344, 2.14756],
			20: [1.18703, 2.17925],
			21: [1.16053, 2.21129]
		},
		91: {
			2: [1.63664, 1.68102],
			3: [1.61425, 1.70395],
			4: [1.59154, 1.72747],
			5: [1.56850, 1.75157],
			6: [1.54516, 1.77625],
			7: [1.52154, 1.80147],
			8: [1.49763, 1.82725],
			9: [1.47345, 1.85356],
			10: [1.44903, 1.88040],
			11: [1.42437, 1.90774],
			12: [1.39948, 1.93557],
			13: [1.37440, 1.96389],
			14: [1.34911, 1.99268],
			15: [1.32365, 2.02192],
			16: [1.29803, 2.05159],
			17: [1.27226, 2.08168],
			18: [1.24637, 2.11217],
			19: [1.22035, 2.14305],
			20: [1.19424, 2.17430],
			21: [1.16803, 2.20590]
		},
		92: {
			2: [1.63870, 1.68259],
			3: [1.61656, 1.70526],
			4: [1.59410, 1.72851],
			5: [1.57132, 1.75232],
			6: [1.54824, 1.77670],
			7: [1.52488, 1.80161],
			8: [1.50125, 1.82707],
			9: [1.47736, 1.85304],
			10: [1.45321, 1.87953],
			11: [1.42883, 1.90652],
			12: [1.40423, 1.93399],
			13: [1.37943, 1.96194],
			14: [1.35444, 1.99033],
			15: [1.32927, 2.01918],
			16: [1.30393, 2.04845],
			17: [1.27846, 2.07813],
			18: [1.25285, 2.10821],
			19: [1.22713, 2.13867],
			20: [1.20129, 2.16949],
			21: [1.17538, 2.20066]
		},
		93: {
			2: [1.64073, 1.68414],
			3: [1.61883, 1.70656],
			4: [1.59661, 1.72954],
			5: [1.57409, 1.75308],
			6: [1.55127, 1.77716],
			7: [1.52818, 1.80176],
			8: [1.50480, 1.82690],
			9: [1.48117, 1.85255],
			10: [1.45730, 1.87870],
			11: [1.43321, 1.90534],
			12: [1.40889, 1.93246],
			13: [1.38437, 1.96004],
			14: [1.35966, 1.98806],
			15: [1.33477, 2.01652],
			16: [1.30972, 2.04540],
			17: [1.28453, 2.07469],
			18: [1.25920, 2.10436],
			19: [1.23376, 2.13441],
			20: [1.20821, 2.16482],
			21: [1.18259, 2.19556]
		},
		94: {
			2: [1.64272, 1.68567],
			3: [1.62106, 1.70784],
			4: [1.59908, 1.73055],
			5: [1.57681, 1.75382],
			6: [1.55424, 1.77761],
			7: [1.53140, 1.80192],
			8: [1.50829, 1.82675],
			9: [1.48493, 1.85209],
			10: [1.46133, 1.87791],
			11: [1.43750, 1.90421],
			12: [1.41345, 1.93097],
			13: [1.38921, 1.95820],
			14: [1.36478, 1.98586],
			15: [1.34016, 2.01394],
			16: [1.31540, 2.04244],
			17: [1.29049, 2.07134],
			18: [1.26544, 2.10062],
			19: [1.24027, 2.13027],
			20: [1.21500, 2.16027],
			21: [1.18965, 2.19061]
		},
		95: {
			2: [1.64469, 1.68717],
			3: [1.62325, 1.70910],
			4: [1.60152, 1.73156],
			5: [1.57948, 1.75455],
			6: [1.55715, 1.77807],
			7: [1.53456, 1.80210],
			8: [1.51171, 1.82663],
			9: [1.48861, 1.85164],
			10: [1.46527, 1.87715],
			11: [1.44171, 1.90311],
			12: [1.41793, 1.92954],
			13: [1.39395, 1.95642],
			14: [1.36980, 1.98372],
			15: [1.34546, 2.01144],
			16: [1.32096, 2.03957],
			17: [1.29632, 2.06808],
			18: [1.27155, 2.09699],
			19: [1.24666, 2.12624],
			20: [1.22166, 2.15585],
			21: [1.19657, 2.18579]
		},
		96: {
			2: [1.64661, 1.68866],
			3: [1.62541, 1.71034],
			4: [1.60390, 1.73256],
			5: [1.58211, 1.75529],
			6: [1.56002, 1.77853],
			7: [1.53768, 1.80227],
			8: [1.51508, 1.82651],
			9: [1.49223, 1.85123],
			10: [1.46914, 1.87642],
			11: [1.44584, 1.90206],
			12: [1.42232, 1.92815],
			13: [1.39861, 1.95469],
			14: [1.37472, 1.98164],
			15: [1.35065, 2.00900],
			16: [1.32643, 2.03677],
			17: [1.30205, 2.06492],
			18: [1.27755, 2.09345],
			19: [1.25292, 2.12232],
			20: [1.22819, 2.15154],
			21: [1.20337, 2.18109]
		},
		97: {
			2: [1.64851, 1.69012],
			3: [1.62752, 1.71157],
			4: [1.60625, 1.73354],
			5: [1.58469, 1.75602],
			6: [1.56284, 1.77899],
			7: [1.54073, 1.80246],
			8: [1.51838, 1.82641],
			9: [1.49577, 1.85083],
			10: [1.47294, 1.87571],
			11: [1.44989, 1.90105],
			12: [1.42663, 1.92681],
			13: [1.40318, 1.95301],
			14: [1.37955, 1.97963],
			15: [1.35574, 2.00665],
			16: [1.33178, 2.03407],
			17: [1.30767, 2.06186],
			18: [1.28342, 2.09001],
			19: [1.25906, 2.11851],
			20: [1.23459, 2.14735],
			21: [1.21003, 2.17652]
		},
		98: {
			2: [1.65038, 1.69156],
			3: [1.62962, 1.71279],
			4: [1.60856, 1.73452],
			5: [1.58721, 1.75674],
			6: [1.56561, 1.77946],
			7: [1.54373, 1.80266],
			8: [1.52162, 1.82632],
			9: [1.49926, 1.85046],
			10: [1.47667, 1.87503],
			11: [1.45387, 1.90006],
			12: [1.43087, 1.92552],
			13: [1.40767, 1.95139],
			14: [1.38428, 1.97768],
			15: [1.36073, 2.00436],
			16: [1.33702, 2.03142],
			17: [1.31318, 2.05886],
			18: [1.28919, 2.08666],
			19: [1.26508, 2.11481],
			20: [1.24088, 2.14328],
			21: [1.21657, 2.17208]
		},
		99: {
			2: [1.65223, 1.69298],
			3: [1.63167, 1.71399],
			4: [1.61082, 1.73548],
			5: [1.58971, 1.75746],
			6: [1.56833, 1.77993],
			7: [1.54669, 1.80285],
			8: [1.52480, 1.82625],
			9: [1.50268, 1.85010],
			10: [1.48033, 1.87439],
			11: [1.45778, 1.89911],
			12: [1.43502, 1.92426],
			13: [1.41206, 1.94982],
			14: [1.38894, 1.97578],
			15: [1.36563, 2.00213],
			16: [1.34218, 2.02886],
			17: [1.31859, 2.05596],
			18: [1.29486, 2.08341],
			19: [1.27100, 2.11120],
			20: [1.24704, 2.13931],
			21: [1.22298, 2.16774]
		},
		100: {
			2: [1.65404, 1.69439],
			3: [1.63369, 1.71517],
			4: [1.61306, 1.73643],
			5: [1.59216, 1.75818],
			6: [1.57100, 1.78039],
			7: [1.54958, 1.80306],
			8: [1.52793, 1.82619],
			9: [1.50604, 1.84976],
			10: [1.48394, 1.87377],
			11: [1.46162, 1.89820],
			12: [1.43910, 1.92305],
			13: [1.41639, 1.94830],
			14: [1.39350, 1.97394],
			15: [1.37045, 1.99997],
			16: [1.34724, 2.02636],
			17: [1.32390, 2.05313],
			18: [1.30041, 2.08024],
			19: [1.27680, 2.10767],
			20: [1.25310, 2.13544],
			21: [1.22928, 2.16352]
		}
	};
	//The argument 'd' takes only the values '0'-->'dL' and '1'-->'du'. 
	return Durbin[T][k][d];
}
/*Econometrics*/
euriklis.Econometrics = new Object();
(function (exports) {
	/**
	 * This function estimates exactly the ARMA coefficients
	 * using the Kalaman filter. It initializes the ARMA coefficients using a method
	 * of Hannan and Kavalieris. This algorithm is translated 
	 * from the arma_mle matlab function implemented from Constantino Hevia (2008).
	 * For more information see the article of World Bank:
	 * http://siteresources.worldbank.org/DEC/Resources/Hevia_ARMA_estimation.pdf
	 * The function name in this library is arma_mle_exact_kalaman or armaMleExactKalaman. 
	 */
	function arma_mle_exact_kalaman(y, p, q, info) {

		/**
		 * set the info parameter if is not set
		 */
		info = info || 0;
		/**
		 * set p and q to be >= 1
		 */
		if (p < 1 && q < 1) euriklis.nrerror('ARMA_MLE_KALAMAN: p and q can be greater or equal to 1!!!')
		else {
			if (p < 1) euriklis.nrerror('ARMA_MLE_KALAMAN: p must be greater or equal to 1!!!')
			else {
				if (q < 1) euriklis.nrerror('ARMA_MLE_KALAMAN: q must be greater or equal to 1!!!');
			}
		}
		/**
		 * set y to be column vector if is Array typed or 
		 * if is vector setries or something else: 
		 * cpy --> copy y
		 */
		var setY = (() => {
			var cpy;
			y.constructor === Array ? cpy = y.toMatrix() :
				y.constructor === euriklis.Mathematics.Matrix ?
					cpy = euriklis.Mathematics.cloning(y) :
					euriklis.nrerror('y can be Array or Matrix type!');
			cpy.constructor === euriklis.Mathematics.Matrix ?
				cpy.rows >= 1 && cpy.columns === 1 ? cpy = euriklis.Mathematics.cloning(cpy) :
					cpy.rows === 1 && cpy.columns >= 1 ? cpy = cpy.transpose() :
						euriklis.nrerror('y can be vector!') :
				euriklis.nrerror('y can be Matrix type!');
			return cpy;
		})();
		var cpy = setY, T = cpy.rows;
		/**
		 * internal functions:
		 */
		var initialize_arma = (ny, p, q) => {
			/**
			 * This function uses Hannan and McDougall (1988) to initialize the
			 * coefficients of the ARMA process using a regression approach. 
			 */
			/** 
			 * Step 1: Choose order of autoregression.
			 */
			var T = ny.rows;
			var best = 1e+10, h, i, j, Y, X, beta, res,
				sigma2, BIC, horder, residuals, coefs;
			for (h = p; h < Math.ceil(Math.pow(Math.log(T), 1.5)); h++) {
				Y = ny.getBlock([h, 0], [T - 1, 0]);
				X = euriklis.Mathematics.createMatrix(T - h, 0);
				for (j = 0; j < h; j++) X.addLastColumn(ny.getBlock([h - j - 1, 0], [T - j - 2, 0]).M);
				beta = X.transpose().times(X).InverseMatrix()
					.times(X.transpose()).times(Y);
				res = Y.minus(X.times(beta));
				sigma2 = res.transpose().times(res).M[0][0] / res.rows;
				BIC = Math.log(sigma2) + h * Math.log(T) / T;
				if (BIC < best) {
					best = BIC;
					horder = h;
					residuals = res;
				}
			}
			/**
			 * Step2: Run regression on lagged values and residuals
			 */

			var nlag = Math.max(p, q);
			Y = ny.getBlock([horder + nlag, 0], [T - 1, 0]);
			X = euriklis.Mathematics.createMatrix(T - horder - nlag, 0);
			for (i = 0; i < p; i++) {
				X.addLastColumn(ny.getBlock([horder + nlag - 1 - i, 0], [T - 2 - i, 0]).M);
			}
			for (i = 0; i < q; i++) {
				X.addLastColumn(residuals.getBlock([nlag - i - 1, 0], [T - horder - i - 2, 0]).M);
			}
			beta = X.transpose()
				.times(X)
				.InverseMatrix()
				.times(X.transpose())
				.times(Y);
			coefs = beta.getBlock([0, 0], [p + q - 1, 0]);
			return coefs.transpose().M;
		}
		function log_likelihood(coefs2) {
			/**
			 * This function computes the negative of the log-likelihood of an
			 * ARMA (p,q) model:
			 * y[t] = phi(1)y[t-1] + ... + phi(p)y[t-p] + ... 
			 * + e[t] + theta(1)e[t-1] + ... + theta(q)e[t-q],
			 * where phi = coefs[from 0 to p -1] and theta = coefs[from p to p + q]
			 */
			/**
			 * set the coefs like row vector:
			 */
			var coefs = coefs2.constructor === Array && !isNaN(coefs2[0]) ?
				euriklis.Mathematics.cloning([coefs2]) : coefs2;
			if (coefs.rows == 1) { coefs = coefs.transpose(); }
			var r = Math.max(p, q + 1);
			var phi = coefs.getBlock([0, 0], [p - 1, 0]),
				xhat_tt, sigma_tt, xhat_t1t, sigma_t1t, yhat_t1t,
				omega, delta_t1, innov, xhat_t1t1, sigma_t1t1, L, sigmahat, i,
				theta = coefs.getBlock([p, 0], [p + q - 1, 0]), A, R, Z, Q, logsum, sumsq;
			/**
			 * Build matrices of state space representation:
			 * x[t+1] = A x[t] + R eps[t+1]
			 * y[t]   = Z'x[t]
			 */
			A = euriklis.Mathematics.zeros(r, r);
			R = euriklis.Mathematics.zeros(r, 1);
			Z = euriklis.Mathematics.zeros(r, 1);
			A.setBlock([0, 0], [p - 1, 0], phi);
			A.setBlock([0, 1], [r - 2, r - 1], euriklis.Mathematics.identity(r - 1).M);
			R.M[0][0] = 1;
			R.setBlock([1, 0], [q, 0], theta);
			Z.M[0][0] = 1;
			Q = R.times(R.transpose());
			/**
			 * Initialize state and covariance matrix:
			 */
			xhat_tt = euriklis.Mathematics.zeros(r, 1);
			sigma_tt = euriklis.Mathematics
				.identity(r * r)
				.minus(A.Kronecker(A))
				.InverseMatrix()
				.times(Q.reshape(r * r, 1))
				.reshape(r, r);
			logsum = 0;
			sumsq = 0;
			/**
			 * Start Kalman Filter Recursion:
			 */
			for (i = -1; i < T - 1; i++) {
				xhat_t1t = A.times(xhat_tt);
				sigma_t1t = A.times(sigma_tt).times(A.transpose()).plus(Q);
				yhat_t1t = Z.transpose().times(xhat_t1t).M[0][0];
				omega = Z.transpose().times(sigma_t1t).times(Z).M[0][0];
				delta_t1 = sigma_t1t.times(Z).times(1 / omega);
				innov = cpy.M[i + 1][0] - yhat_t1t;
				xhat_t1t1 = xhat_t1t.plus(delta_t1.times(innov));
				sigma_t1t1 = sigma_t1t.minus(delta_t1.times(Z.transpose()).times(sigma_t1t));
				/**
				 * Add likelihood terms:
				 */
				logsum += Math.log(omega > 0 ? omega : 1e10);
				sumsq += innov * innov / omega;
				/**
				 * Update estimates:
				 */
				xhat_tt = xhat_t1t1;
				sigma_tt = sigma_t1t1;
			}
			L = logsum + T * Math.log(sumsq);
			sigmahat = Math.sqrt(sumsq / T);
			return { L: L, sigmahat: sigmahat };
		}
		function _log_likelihood_(coefsk) {
			return log_likelihood(coefsk).L;
		}
		/**
		 * INITIALIZE COEFFICIENTS USING Hannan and McDougall (1988)
		 */
		var coefs = initialize_arma(cpy, p, q);
		var coefs1 = euriklis
			.Mathematics
			.programming
			.minimize(_log_likelihood_, coefs).solution;
		var LL = log_likelihood(coefs1), results = {};
		results.phi = coefs1.getBlock([0, 0], [0, p - 1]);
		results.theta = coefs1.getBlock([0, p], [0, p + q - 1]);
		results.sigma = LL.sigmahat;
		results.L = -LL.L;
		return results;
	};
	exports.arma_mle_exact_kalaman = arma_mle_exact_kalaman;
	exports.armaMleExactKalaman = arma_mle_exact_kalaman;
})(euriklis.Econometrics);
euriklis.Econometrics.interpolation = function (x, y) {
	this.x = euriklis.Mathematics.cloning(x);
	this.y = euriklis.Mathematics.cloning(y);
}
euriklis.Econometrics.interpolation.prototype.polynomialAt = function (x) {
	var xa = this.x.M,
		ya = this.y.M,
		i, m, ns = 0, n = xa.length, den, dif, dift, ho, hp, w, y, dy, c, d;
	dif = Math.abs(x - xa[0]);
	c = new Array(n);
	d = new Array(n);
	for (i = 1; i <= n; i++) {
		if ((dift = Math.abs(x - xa[i - 1])) < dif) {
			ns = i;
			dif = dift;
		}
		c[i - 1] = ya[i - 1];
		d[i - 1] = ya[i - 1];
	}
	ns -= 1;
	y = ya[ns--];
	ns += 1;
	for (m = 1; m < n; m++) {
		for (i = 1; i <= n - m; i++) {
			ho = xa[i - 1] - x;
			hp = xa[i + m - 1] - x;
			w = c[i] - d[i - 1];
			if ((den = ho - hp) == 0.0) throw new Error("Error in the polynomialAt function");
			den = w / den;
			d[i - 1] = hp * den;
			c[i - 1] = ho * den;
		}
		ns -= 1;
		y += (dy = (2 * ns < (n - m) ? c[ns + 1] : d[ns--]));
		ns += 1;
	}
	return { y: y, dy: dy };
}
euriklis.Econometrics.interpolation.prototype.rationalAt = function (x) {
	var xa = this.x.M,
		ya = this.y.M,
		m, i, n = xa.length, ns = 1, y, dy, w, t, hh, h, dd, c, d, TINY = 1.0e-25;
	c = new Array(n);
	d = new Array(n);
	hh = Math.abs(x - xa[0]);
	for (i = 1; i <= n; i++) {
		h = Math.abs(x - xa[i - 1]);
		if (h == 0.0) {
			y = ya[i];
			dy = 0.0;
			return { y: y, dy: dy };
		}
		else if (h < hh) {
			ns = i;
			hh = h;
		}
		c[i - 1] = ya[i - 1];
		d[i - 1] = ya[i - 1] + TINY;
	}
	ns -= 1;
	y = ya[ns--];
	ns += 1;
	for (m = 1; m < n; m++) {
		for (i = 1; i <= n - m; i++) {
			w = c[i] - d[i - 1];
			h = xa[i + m - 1] - x;
			t = (xa[i - 1] - x) * d[i - 1] / h;
			dd = t - c[i];
			if (dd == 0.0) throw new Error("Error in  ratinalAt function");
			dd = w / dd;
			d[i - 1] = c[i] * dd;
			c[i - 1] = t * dd;
		}
		y += (dy = (2 * ns < (n - m) ? c[ns + 1] : d[ns--]));
	}
	return { y: y, dy: dy };
}
euriklis.Econometrics.interpolation.prototype.cubicSpline = function (yp1, ypn, x) {
	var xa = this.x, ya = this.y;
	/*second derivate points of ya in xa points:*/
	function spline(x, y, yp1, ypn) {
		var i, k, n = x.length, y2 = new Array(), p, qn, sig, un, u = new Array(n - 1);
		if (yp1 > 0.99e+30) y2[1] = u[0] = 0.0;
		else {
			y2[0] = -0.5;
			u[0] = (3.0 / (x[1] - x[0])) * ((y[1] - y[0]) / (x[1] - x[0]) - yp1);
		}
		for (i = 2; i <= n - 1; i++) {
			sig = (x[i - 1] - x[i - 2]) / (x[i] - x[i - 2]);
			p = sig * y2[i - 2] + 2.0;
			y2[i - 1] = (sig - 1.0) / p;
			u[i - 1] = (y[i] - y[i - 1]) / (x[i] - x[i - 1]) - (y[i - 1] - y[i - 2]) / (x[i - 1] - x[i - 2]);
			u[i - 1] = (6.0 * u[i - 1] / (x[i] - x[i - 2]) - sig * u[i - 2]) / p;
		}
		if (ypn > 0.99e+30) qn = un = 0.0;
		else {
			qn = 0.5;
			un = (3.0 / (x[n - 1] - x[n - 2])) * (ypn - (y[n - 1] - y[n - 2]) / (x[n - 1] - x[n - 2]));
		}
		y2[n - 1] = (un - qn * u[n - 2]) / (qn * y2[n - 2] + 1.0);
		for (k = n - 1; k >= 1; k--)y2[k - 1] = y2[k - 1] * y2[k] + u[k - 1];
		return y2;
	}
	/*cubic spline of the xa and ya at point x:*/
	function splint(xa, ya, y1, yn, x) {
		var klo, khi, k, h, b, a, n = xa.length;
		y2a = spline(xa, ya, y1, yn);
		klo = 1;
		khi = n;
		while (khi - klo > 1) {
			k = (khi + klo) >> 1;
			if (xa[k - 1] > x) khi = k;
			else klo = k;
		}
		h = xa[khi - 1] - xa[klo - 1];
		if (h == 0.0) throw new Error("Bad xa input to routine splint");
		a = (xa[khi - 1] - x) / h;
		b = (x - xa[klo - 1]) / h;
		y = a * ya[klo - 1] + b * ya[khi - 1] + ((a * a * a - a) * y2a[klo - 1] + (b * b * b - b) * y2a[khi - 1]) * (h * h) / 6.0;
		return y;
	}
	return {
		secondDerivatePoints: spline(xa, ya, yp1, ypn),
		spline: splint(xa, ya, yp1, ypn, x)
	}
}
euriklis.Econometrics.interpolation.prototype.coefficients = function polcoe() {
	var x = this.x.M, y = this.y.M,
		k, j, i, cof = new Array(), phi, ff, b, s, n = x.length - 1;
	s = new Array(n + 1);
	for (i = 0; i <= n; i++) s[i] = cof[i] = 0.0;
	s[n] = -x[0];
	for (i = 1; i <= n; i++) {
		for (j = n - i; j <= n - 1; j++)s[j] -= x[i] * s[j + 1];
		s[n] -= x[i];
	}
	for (j = 0; j <= n; j++) {
		phi = n + 1;
		for (k = n; k >= 1; k--)phi = k * s[k] + x[j] * phi;
		ff = y[j] / phi;
		b = 1.0;
		for (k = n; k >= 0; k--) {
			cof[k] += b * ff;
			b = s[k] + x[j] * b;
		}
	}
	return cof;
}

euriklis.Econometrics.MEAN = function MEAN(A) {
	var M = euriklis.Mathematics;
	var A = M.cloning(A);
	var tst = A.isEveryElementNumber() && A.rows === 1;
	if (tst) {
		var sum = 0;
		for (i = 0; i < A.columns; i++)sum += A.M[i];
		M = sum / A.columns;
	}
	else M = false;
	return M;
}
euriklis.Econometrics.VAR = function VAR(A1) {
	var A = euriklis.Mathematics.cloning(A1);
	var tst = A.isEveryElementNumber() && A.rows === 1;
	if (tst) {
		//average of the ellements:
		var sum = 0, d = 0, VAR = 0;
		for (i = 0; i < A.columns; i++)sum += A.M[i];
		averageA = sum / A.columns;
		for (i = 0; i < A.columns; i++) {
			d = A.M[i] - averageA;
			VAR += d * d;
		}
		VAR /= A.columns - 1;
	}
	else VAR = false;
	return VAR;
}
euriklis.Econometrics.COVAR = function COVAR(A2, B) {
	var M = euriklis.Mathematics, E = euriklis.Econometrics,
		A = M.cloning(A2), B = M.cloning(B), cov = 0, i, ma = E.MEAN(A), mb = E.MEAN(B);
	if (A.columns !== B.columns) euriklis.nrerror('internal error!');
	for (i = 0; i < A.columns; i++) {
		cov += (A.M[i] - ma) * (B.M[i] - mb);
	}
	cov /= A.columns - 1;
	return cov;
}
euriklis.Econometrics.correlationCoefficient = function correlationCoefficient(A, B) {
	var E = euriklis.Econometrics;
	return E.COVAR(A, B) / Math.sqrt(E.VAR(A) * E.VAR(B));
}
euriklis.Econometrics.correlationMatrix = function correlationMatrix(A) {
	var cloning = euriklis.Mathematics.cloning,
		M = euriklis.Mathematics,
		E = euriklis.Econometrics,
		A = cloning(A), i, j,
		CM = A.columns >= 1 ? M.identity(A.columns) : euriklis.nrerror('internal error!');
	for (i = 0; i < CM.rows; i++) {
		for (j = 0; j < CM.rows; j++) {
			if (i !== j) { CM.M[i][j] = E.correlationCoefficient(A.getColumn(i).transpose().M[0], A.getColumn(j).transpose().M[0]); }
		}
	}
	return CM;
}
euriklis.Econometrics.partial_R_Matrices = function partial_R_Matrices(A) {
	var A = euriklis.Mathematics.cloning(A).M,
		r, pr = new Array(), mr, i, j, k, l
	mR = new Array(), res = new Object(), sqrt = Math.sqrt;
	r = euriklis.Mathematics.cloning(euriklis.Econometrics.correlationMatrix(A)).M;
	for (i = 0; i < r.length; i++) {
		mR[i] = new Array();
		for (j = 0; j < r[0].length; j++) {
			mr = euriklis.Mathematics.cloning(r);
			mr = mr.deleteRow(i);
			mr = mr.deleteCol(j);
			mR[i][j] = mr.Determinant();
		}
	}
	for (k = 0; k < mR.length; k++) {
		pr[k] = new Array();
		for (l = 0; l < mR[0].length; l++) {
			pr[k][l] = (k !== l) ? (- (mR[k][l]) / (sqrt(mR[k][k]) * sqrt(mR[l][l]))) * (- (mR[k][l]) / (sqrt(mR[k][k]) * sqrt(mR[l][l]))) : 1;
		}
	}

	res.partial_R = mR;
	res.partial_r = pr;
	return res;
}
euriklis.Econometrics.entropy = function (n) {
	/**
	 * Given a two-dimensional contingency table in the form of an integer array nn[i][j], where i
     *labels the x variable and ranges from 1 to ni, j labels the y variable and ranges from 1 to nj,
     *this routine returns the entropy h of the whole table, the entropy hx of the x distribution, the
     *entropy hy of the y distribution, the entropy hygx of y given x, the entropy hxgy of x given y,
     *the dependency uygx of y on x , the dependency uxgy of x on y,
     *and the symmetrical dependency uxy.
	 */
	'use strict';
	let nn = euriklis.Mathematics.cloning(n);
	let i, j, ni = nn.rows, nj = nn.columns,
		p, sumi = [], sumj = [], sum = 0, hx,
		hxgy, hygx, h, hy, uxgy, uxy, uygx;
	const log = Mat.log, TINY = 1e-30;
	nn = nn.M;
	for (i = 0; i < ni; i++) {
		sumi[i] = 0.0;
		for (j = 0; j < nj; j++) {
			sumi[i] += nn[i][j];
			sum += nn[i][j];
		}
	}
	for (j = 0; j < nj; j++) {
		sumj[j] = 0.0;
		for (i = 0; i < ni; i++) sumj[j] += nn[i][j];
	}
	hx = 0.0;
	for (i = 0; i < ni; i++)
		if (sumi[i]) {
			p = sumi[i] / sum;
			hx -= p * log(p);
		}
	hy = 0.0;
	for (j = 0; j < nj; j++)
		if (sumj[j]) {
			p = sumj[j] / sum;
			hy -= p * log(p);
		}
	h = 0.0;
	for (i = 0; i < ni; i++)
		for (j = 1; j <= nj; j++)
			if (nn[i][j]) {
				p = nn[i][j] / sum;
				h -= p * log(p);
			}
	hygx = (h) - (hx);
	hxgy = (h) - (hy);
	uygx = (hy - hygx) / (hy + TINY);
	uxgy = (hx - hxgy) / (hx + TINY);
	uxy = 2.0 * (hx + hy - h) / (hx + hy + TINY);
	return {
		'entropy': h,
		'entropy of x': hx,
		'entropy of y': hy,
		'entropy of y given x': hygx,
		'entropy of x given y': hxgy,
		'dependency of y on x': uygx,
		'dependency of x on y': uxgy,
		'symetrical dependency': uxy
	}
}
/*
Least squares method --> OLS
e_t --> from estimation_type
T --> type of the data:
if the data is chronological series
the T contains the years/dates of the data
else if the data is observations then 
T is the observation number, for example 1,2,3...
If T is undefined by definition is observation type.
*/
euriklis.Econometrics.OLS = function OLS(X, Y, e_t, T) {
	var x, y;
	if (typeof T === 'undefined') {
		T = new Array([]);
		for (var obs = 0; obs < X.length; obs++) {
			T[0][obs] = obs + 1;
		}
	}
	var Variables = X.constructor === Array ? X.toMatrix().columns :
		X.columns;
	x = euriklis.Mathematics.cloning(X);
	y = euriklis.Mathematics.cloning(Y);
	if (e_t == 'OLSWithConst' || e_t == 0) { for (i = 0; i < x.M.length; i++) { x.M[i].unshift(1.0); } }
	if (e_t == 'OLSWithoughtConst' || e_t == 1) { x = x; }
	if (e_t == 'OLS_Cobb_Duglas_With_Const' || e_t == 2) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = Math.log(parseFloat(x.M[i][j], 10)); }
			x.M[i].unshift(1.0);
			for (g = 0; g < y.M[i].length; g++) {
				y.M[i][g] = Math.log(parseFloat(y.M[i][g], 10));
			}
		}
	}
	if (e_t == 'OLS_Cobb_Douglas_Withought_Const' || e_t == 3) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = Math.log(parseFloat(x.M[i][j], 10)); }
			//x[i].unshift(1.0);
			for (g = 0; g < y.M[i].length; g++) {
				y.M[i][g] = Math.log(parseFloat(y.M[i][g], 10));
			}
		}
	}
	if (e_t == 'exponent_function' || e_t == 4) {
		for (i = 0; i < y.M.length; i++) {
			for (j = 0; j < y.M[i].length; j++) { y.M[i][j] = Math.log(y.M[i][j]); }
			x.M[i].unshift(1.0);
		}
	}
	if (e_t == 'exponent_function_Withougth_Const' || e_t == 5) {
		for (i = 0; i < y.M.length; i++) {
			for (j = 0; j < y.M[i].length; j++) { y.M[i][j] = Math.log(y.M[i][j]); }
		}
	}
	if (e_t == 'Linear_Logarithmic_function' || e_t == 6) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = Math.log(x.M[i][j]); }
			x.M[i].unshift(1.0);
		}
	}
	if (e_t == 'Inverse_Function' || e_t == 7) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = 1 / (x.M[i][j]); }
			x.M[i].unshift(1.0);
		}
	}
	if (e_t == 'Linear_Logarithmic_function_Withought_Const' || e_t == 8) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = Math.log(x.M[i][j]); }
		}
	}
	if (e_t == 'Inverse_Function_Withought_Const' || e_t == 9) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = 1 / (x.M[i][j]); }
		}
	}

	var xT = x.transpose();
	var xx = xT.times(x);
	/*if (Determinant(xx)==0){
	var Error= 'Υπάρχει αυτοσυσχέτιση και δεν μπορεί να γίνει εκτίμηση με τη μέθοδο OLS';
	alert(Error);
						   }*/
	var Ixx = xx.InverseMatrix();
	var xTy = xT.times(y);
	var OLS = Ixx.times(xTy);
	//Errors of the model: var ---> e
	var xb = x.times(OLS);
	var Mxb = xb.times(-1);
	var e = y.plus(Mxb);
	//Dispertion
	var Te = e.transpose();//Transponse of the errors vector.
	var Var_SQ = Te.times(e).M[0][0];
	var Var_S = (Var_SQ) / (x.M.length - x.M[0].length);//---->s^2
	//Dispersion of the b-vector:
	var Var_b = Ixx.times(Var_S);
	//R-Square
	var Ty = y.transpose();
	var Tyy = Ty.times(y).M[0][0];
	var SUMY = y.transpose().M[0].toMatrix().SumOfElements();
	var R = 1 - (Var_SQ / (Tyy - (SUMY * SUMY / x.M.length)));//R/
	var CoR = 1 - (((x.M.length - 1) / (x.M.length - Variables - 1)) * (1 - R));//R-Ajusted
	/* 
	@For the following expressions see the book of the 
	@ ANASTASIOS V. KATOS : Econometrics - Theory and 
	@ practice, Thessaloniki, zygos, 2004.pp349-351.
	*/
	// the L or logarithmic likelihood ratio
	var l = (-1) * (x.M.length / 2) * (1 + Math.log(2 * Math.PI) + Math.log((Var_SQ / x.M.length)));
	// the AIC or Akaike, 1970.
	var AIC = ((-2) * l / x.M.length) + ((2 * (Variables + 1)) / x.M.length);
	//SBIC
	var SBIC = ((-2) * l / x.M.length) + ((Math.log(x.M.length) * (Variables + 1)) / x.M.length);
	//HQ 
	var HQ = (Var_SQ / x.M.length) * (Math.pow(Math.log(x.M.length), ((2 * (Variables)) / x.M.length)));
	//GCV
	var GCV = (Var_SQ / x.M.length) * Math.pow((1 - ((Variables) / x.M.length)), -2);
	//RICE
	var RICE = (Var_SQ / x.M.length) * Math.pow((1 - (2 * (Variables) / x.M.length)), -1);
	//SH
	var SH = (Var_SQ / x.M.length) * ((x.M.length + 2 * (Variables)) / x.M.length);   //PC
	var PC = (Var_SQ / (x.M.length - Variables)) * ((x.M.length + Variables) / x.M.length);
	//F -statistic
	var F = (R / (x.M[0].length - 1)) / ((1 - R) / (x.M.length - Variables - 1));
	//Durbin-Watson statistic.
	var A = new Array();
	for (i = 0; i < x.M.length; i++) { A[i] = new Array(x.M.length); }
	for (i = 0; i < x.M.length; i++) {
		for (j = 0; j < x.M.length; j++) {
			if ((i == 0 && j == 0) || (i == (x.M.length - 1) && j == (x.M.length - 1))) { A[i][j] = 1; }
			else {
				if ((i == j)) { A[i][j] = 2; }
				else { A[i][j] = 0; }
			}
		}
	}
	for (i = 0; i < x.M.length - 1; i++) { A[i + 1][i] = -2; }
	A = euriklis.Mathematics.cloning(A);
	var TeA = Te.times(A);
	var DW = (TeA.times(e).M[0][0]) / Var_SQ;
	var OUTPUT =
	{
		'T': T,
		'observations': x.M.length,
		'variables': Variables,
		'Coefficients': OLS,
		'x': x,
		'y': y,
		'e': e,
		'XX': xx,
		'ESS': Var_SQ,
		'Var_S': Var_S,
		'Var_b': Var_b,
		'R': R,
		'AjR': CoR,
		'l': l,
		'AIC': AIC,
		'SBIC': SBIC,
		'HQ': HQ,
		'GCV': GCV,
		'RICE': RICE,
		'SH': SH,
		'PC': PC,
		'F_stat': F,
		'DW': DW
	};
	return OUTPUT;
}
euriklis.Econometrics.ridge_regression = function (X, Y, e_t, δ, T) {
	var x, y;
	if (typeof T === 'undefined') {
		T = new Array([]);
		for (var obs = 0; obs < X.length; obs++) {
			T[0][obs] = obs + 1;
		}
	}
	var Variables = X.constructor === Array ? X.toMatrix().columns :
		X.columns;
	x = euriklis.Mathematics.cloning(X);
	y = euriklis.Mathematics.cloning(Y);
	if (e_t == 'OLSWithConst' || e_t == 0) { for (i = 0; i < x.M.length; i++) { x.M[i].unshift(1.0); } }
	if (e_t == 'OLSWithoughtConst' || e_t == 1) { x = x; }
	if (e_t == 'OLS_Cobb_Duglas_With_Const' || e_t == 2) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = Math.log(parseFloat(x.M[i][j], 10)); }
			x.M[i].unshift(1.0);
			for (g = 0; g < y.M[i].length; g++) {
				y.M[i][g] = Math.log(parseFloat(y.M[i][g], 10));
			}
		}
	}
	if (e_t == 'OLS_Cobb_Douglas_Withought_Const' || e_t == 3) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = Math.log(parseFloat(x.M[i][j], 10)); }
			//x[i].unshift(1.0);
			for (g = 0; g < y.M[i].length; g++) {
				y.M[i][g] = Math.log(parseFloat(y.M[i][g], 10));
			}
		}
	}
	if (e_t == 'exponent_function' || e_t == 4) {
		for (i = 0; i < y.M.length; i++) {
			for (j = 0; j < y.M[i].length; j++) { y.M[i][j] = Math.log(y.M[i][j]); }
			x.M[i].unshift(1.0);
		}
	}
	if (e_t == 'exponent_function_Withougth_Const' || e_t == 5) {
		for (i = 0; i < y.M.length; i++) {
			for (j = 0; j < y.M[i].length; j++) { y.M[i][j] = Math.log(y.M[i][j]); }
		}
	}
	if (e_t == 'Linear_Logarithmic_function' || e_t == 6) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = Math.log(x.M[i][j]); }
			x.M[i].unshift(1.0);
		}
	}
	if (e_t == 'Inverse_Function' || e_t == 7) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = 1 / (x.M[i][j]); }
			x.M[i].unshift(1.0);
		}
	}
	if (e_t == 'Linear_Logarithmic_function_Withought_Const' || e_t == 8) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = Math.log(x.M[i][j]); }
		}
	}
	if (e_t == 'Inverse_Function_Withought_Const' || e_t == 9) {
		for (i = 0; i < x.M.length; i++) {
			for (j = 0; j < x.M[i].length; j++) { x.M[i][j] = 1 / (x.M[i][j]); }
		}
	}

	var xT = x.transpose();
	var xx = xT.times(x);
	/*if (Determinant(xx)==0){
	var Error= 'Υπάρχει αυτοσυσχέτιση και δεν μπορεί να γίνει εκτίμηση με τη μέθοδο OLS';
	alert(Error);
						   }*/
	var Ixx = xx.plus(euriklis.Mathematics.identity(xx.rows).times(δ)).InverseMatrix();
	var xTy = xT.times(y);
	var OLS = Ixx.times(xTy);
	//Errors of the model: var ---> e
	var xb = x.times(OLS);
	var Mxb = xb.times(-1);
	var e = y.plus(Mxb);
	//Dispertion
	var Te = e.transpose();//Transponse of the errors vector.
	var Var_SQ = Te.times(e).M[0][0];
	var Var_S = (Var_SQ) / (x.M.length - x.M[0].length);//---->s^2
	//Dispersion of the b-vector:
	var Var_b = Ixx.times(xx).times(Ixx).times(Var_S);
	//R-Square
	var Ty = y.transpose();
	var Tyy = Ty.times(y).M[0][0];
	var SUMY = y.transpose().M[0].toMatrix().SumOfElements();
	var R = 1 - (Var_SQ / (Tyy - (SUMY * SUMY / x.M.length)));//R/
	var CoR = 1 - (((x.M.length - 1) / (x.M.length - Variables - 1)) * (1 - R));//R-Ajusted
	/* 
	@For the following expressions see the book of the 
	@ ANASTASIOS V. KATOS : Econometrics - Theory and 
	@ practice, Thessaloniki, zygos, 2004.pp349-351.
	*/
	// the L or logarithmic likelihood ratio
	var l = (-1) * (x.M.length / 2) * (1 + Math.log(2 * Math.PI) + Math.log((Var_SQ / x.M.length)));
	// the AIC or Akaike, 1970.
	var AIC = ((-2) * l / x.M.length) + ((2 * (Variables + 1)) / x.M.length);
	//SBIC
	var SBIC = ((-2) * l / x.M.length) + ((Math.log(x.M.length) * (Variables + 1)) / x.M.length);
	//HQ 
	var HQ = (Var_SQ / x.M.length) * (Math.pow(Math.log(x.M.length), ((2 * (Variables)) / x.M.length)));
	//GCV
	var GCV = (Var_SQ / x.M.length) * Math.pow((1 - ((Variables) / x.M.length)), -2);
	//RICE
	var RICE = (Var_SQ / x.M.length) * Math.pow((1 - (2 * (Variables) / x.M.length)), -1);
	//SH
	var SH = (Var_SQ / x.M.length) * ((x.M.length + 2 * (Variables)) / x.M.length);   //PC
	var PC = (Var_SQ / (x.M.length - Variables)) * ((x.M.length + Variables) / x.M.length);
	//F -statistic
	var F = (R / (x.M[0].length - 1)) / ((1 - R) / (x.M.length - Variables - 1));
	//Durbin-Watson statistic.
	var A = new Array();
	for (i = 0; i < x.M.length; i++) { A[i] = new Array(x.M.length); }
	for (i = 0; i < x.M.length; i++) {
		for (j = 0; j < x.M.length; j++) {
			if ((i == 0 && j == 0) || (i == (x.M.length - 1) && j == (x.M.length - 1))) { A[i][j] = 1; }
			else {
				if ((i == j)) { A[i][j] = 2; }
				else { A[i][j] = 0; }
			}
		}
	}
	for (i = 0; i < x.M.length - 1; i++) { A[i + 1][i] = -2; }
	A = euriklis.Mathematics.cloning(A);
	var TeA = Te.times(A);
	var DW = (TeA.times(e).M[0][0]) / Var_SQ;
	var OUTPUT =
	{
		'T': T,
		'observations': x.M.length,
		'variables': Variables,
		'Coefficients': OLS,
		'x': x,
		'y': y,
		'e': e,
		'XX': xx,
		'ESS': Var_SQ,
		'Var_S': Var_S,
		'Var_b': Var_b,
		'R': R,
		'AjR': CoR,
		'l': l,
		'AIC': AIC,
		'SBIC': SBIC,
		'HQ': HQ,
		'GCV': GCV,
		'RICE': RICE,
		'SH': SH,
		'PC': PC,
		'F_stat': F,
		'DW': DW
	};
	return OUTPUT;
}
euriklis.Econometrics.Heteroscedasticity = new Object();
(function (exports) {
	function estimate_when_dispersion_matrix_is_known(X, Y, hdke_t, dispersions, T) {
		var b_gls, olsh = euriklis.Econometrics.OLS(X, Y, hdke_t, T);
		var y_gls_estimation, e_gls_estimation, x = olsh.x, y = olsh.y, s = olsh.Var_S;
		dispersions = euriklis.Mathematics.cloning(dispersions);
		var p = euriklis.Mathematics.createMatrix(x.rows, x.rows),
			ee, xx, yy, xw_1x, var_s, var_b, i, j,
			sumy, R, AdjR, l, AIC, SBIC, HQ, GCV, RICE, SH, PC, DW;
		for (i = 0; i < x.rows; i++) {
			for (j = 0; j < x.rows; j++)p.M[i][j] = i === j ? 1 / Math.sqrt(dispersions.M[0][i]) : 0;
		}
		var x_star = p.times(x), y_star = p.times(y);
		var output = euriklis.Econometrics.OLS(x_star, y_star, 1, T);
		return output;
	}
	function HCCM(X, Y, hccme_t, T) {
		var regression = euriklis.Econometrics.OLS(X, Y, hccme_t, T);
		var e = regression.e, x = regression.x;
		regression.Var_b = regression.XX.InverseMatrix()
			.times(e.transpose().times(regression.XX).times(e)).times(regression.XX.InverseMatrix())
			.times(regression.observations / (regression.observations - x.columns));
		return regression;
	}
	function multiplicated_general_type(X, Y, Z, mhe_t, T) {
		/* make sure that all data variables are Matrix type */
		Z = euriklis.Mathematics.cloning(Z);
		/* check if the matrices X,Y and Z are correctly input */
		if (X.rows !== Y.rows) euriklis.nrerror('Incorrect X or Y matrix!');
		if (X.rows !== Z.rows || Y.rows !== Z.rows) euriklis.nrerror('Incorrect input of Z matrix!');
		if (Z.columns !== 1) euriklis.nrerror('The columns of Z matrix can be equal to 1!');
		/* create new matrices x and y and set them: new_y[i] = Y[i]/Z[i] and new_x[i] = X[i]/Z[i] */
		var new_y = euriklis.Econometrics.OLS(X, Y, mhe_t).y,
			new_x = euriklis.Econometrics.OLS(X, Y, mhe_t).x,
			i, j, n = new_x.rows, m = new_x.columns;
		for (i = 0; i < n; i++) {
			new_y.M[i][0] = Y.M[i][0] / Z.M[i][0];
			for (j = 0; j < m; j++)new_x.M[i][j] = X.M[i][j] / Z.M[i][0];
		}
		/* Estimate the ols with the new matrices: */
		return euriklis.Econometrics.OLS(new_x, new_y, 1, T);
	}
	function multiplicated_xj(X, Y, column, mxje_t, T) {
		/* create new matrices x and y: */
		var regression = euriklis.Econometrics.OLS(X, Y, 1, T),
			new_x = regression.x,
			new_y = regression.y, xr = x.rows;
		/* check if column number is number and if is smaller than x columns: */
		column = !Number.isInteger(column) ? euriklis.nrerror('The column parameter can be a number!') :
			column >= new_x.columns ? euriklis.nrerror('The column parameter can be smaller than the x columns!') :
				column;
		/* get the x column and set it: x[j] = sqrt(x[j]) */
		var z = new_x
			.getColumn(column)
			.setting({
				from: [0, 0],
				to: [xr, 1],
				expression: 'this.M[i][j] = Math.sqrt(this.M[i][j])'
			});
		/* Estimate the ols with the multipl. general type method: */
		return multiplicated_general_type(new_x, new_y, z, mxje_t, T);
	}
	function multiplicated_xj_square(X, Y, column, mxjsqe_t, T) {
		/* create new matrices x and y: */
		var new_x = euriklis.Mathematics.cloning(X),
			new_y = euriklis.Mathematics.cloning(Y);
		/* check if column number is number and if is smaller than x columns: */
		column = !Number.isInteger(column) ? euriklis.nrerror('The column parameter can be a number!') :
			column >= new_x.columns ? euriklis.nrerror('The column parameter can be smaller than the x columns!') :
				column;
		/* get the x column: */
		var z = new_x.getColumn(column);
		/* estimate the ols with the multipl. general type method: */
		return multiplicated_general_type(new_x, new_y, z, mxjsqe_t, T);
	}
	function multiplicated_yj_square(X, Y, myje_t, T) {
		/* get the estimated y: */
		var regression = euriklis.Econometrics.OLS(X, Y, myje_t, T);
		var y_star = regression.x.times(regression.Coefficients);
		/* estimate: */
		return multiplicated_general_type(X, Y, y_star, myje_t, T);
	}
	function linear(X, Y, z_combinations, le_t, T) {
		/* Estimating of the Heteroscedasticity when the 
		 dispersions are not known and the Heteroscedasticity is linear
		 in the form : σ^2 = α0 + α1*zi,1 + α2*zi,2 +..., where the z's are
		 combinations like x[i][1]^2, x[i][j]*x[i][k]*...*x[i][n].To present 
		 this combinations in the variable z_combinations we write the column indices 
		 of the x matrix, i.e if z_combinations = [[0,0],[0,1,2]] means that 
		 z[i][0] = x[i][0]^2 and z[i][1] = x[i][0]*x[i][1]*x[i][2].
		*/
		/* loop variables: */
		var i, j;
		/* For the technical details see Katos, pp 418-19 */
		/* estimate the y with ols: */
		var regression = euriklis.Econometrics.OLS(X, Y, le_t, T);
		/* get the sqares of e: */
		var e = regression.e;
		var e_sq = euriklis.Mathematics.createMatrix(regression.observations, 1);
		for (i = 0; i < e_sq.rows; i++)e_sq.M[i][0] = e.M[i][0] * e.M[i][0];
		/* create the z matrix: */
		var z = euriklis.Mathematics.createMatrix(regression.x.rows, z_combinations.length);
		for (i = 0; i < z.rows; i++) {
			for (j = 0; j < z.columns; j++) {
				z.M[i][j] = 1;
				for (k = 0; k < z_combinations[j].length; k++) {
					if (z_combinations[j][k] < regression.x.columns && z_combinations[j][k] >= 0) {
						z.M[i][j] *= regression.x.M[i][z_combinations[j][k]];
					}
				}
			}
		}
		/* estimate the σi^2 */
		var regression1 = euriklis.Econometrics.OLS(z, e_sq, 0, T);
		var e_sq_star = regression1.x.times(regression1.Coefficients);
		/* estimate the dispersion for second time: */
		var regression2 = multiplicated_general_type(z, e_sq, e_sq_star, 0, T);
		var e_star = euriklis.Mathematics.createMatrix(e_sq.rows, 1);
		for (i = 0; i < e_sq.rows; i++) {
			e_star.M[i][0] = Math.sqrt(e_sq_star.M[i][0]);
		}
		return multiplicated_general_type(X, Y, e_star, le_t);
	}
	exports.estimate_when_dispersion_matrix_is_known = estimate_when_dispersion_matrix_is_known;
	exports.HCCM = HCCM;
	exports.multiplicated_general_type = multiplicated_general_type;
})(euriklis.Econometrics.Heteroscedasticity);
euriklis.Econometrics.TestHypothesis = new Object();
euriklis.Econometrics.TestHypothesis.t = function (X, Y, e_t, indexes, indexes_b0, sign, T) {
	/*
   @This function test the statistical significance of the coefficients
   @to be equal to a given value. The param. X is the input matrix of the
   @OLS model, the Y is the data output matrix, the e_t is the kind of 
   @estimation of our model, the indexes is an Array that contains the indexes of 
   @the OLS-estimated coefficients in the OLS output of the OLS function,
   @indexes_b0 is an Array that contains the zero-hypothesis values of the 
   @selected in the Array 'indexes' coefficients and the parameter sign is
   @the significant level of the t-student distribution test.
	*/
	var regression = euriklis.Econometrics.OLS(X, Y, e_t, T);
	var b = regression.Coefficients;
	var V = regression.Var_b;
	var t_Pinax = euriklis.Distribution.t_Student((regression.observations - b.rows), sign, 0.000001, 'X');
	var t_PinaxDual = euriklis.Distribution.t_Student((regression.observations - b.rows), (sign / 2), 0.000001, 'X');
	//console.log(regression.observations-b.rows);
	var t_statistic = new Array();
	var t_prob = new Array();
	var t_test_output = new Array();
	var t_rightHand_test = new Array();
	var t_leftHand_test = new Array();
	var t_dual_test = new Array();
	var VARB = new Array();
	for (i = 0; i < V.rows; i++) { VARB[i] = Math.sqrt(V.M[i][i]); }
	//console.log(VARB)
	//console.log(V)
	//console.log(t_statistic);
	if ((indexes.constructor == Array || indexes == 'all') && (indexes_b0 === Object(indexes_b0))) {
		if (indexes.constructor === Array ? indexes.toMatrix().isEveryElementNumber() && Math.max.apply(null, indexes) < b.rows : indexes === 'all') {
			if (indexes_b0.set) {
				for (i = 0; i < indexes.length; i++) {
					t_statistic[i] = parseFloat(b.M[indexes[i]] - parseFloat(indexes_b0.set[i])) / parseFloat(VARB[indexes[i]]);
				}
			}
			else {
				if (!indexes_b0.fix) {
					for (i = 0; i < indexes.length; i++) {
						t_statistic[i] = (b.M[indexes[i]] - indexes_b0.fix[0]) / VARB[indexes[i]];
					}

				}
			}
		}
		//console.log(t_statistic);
		if ((indexes == 'all') && (indexes_b0.fix)) {
			for (var i = 0; i < b.rows; i++) {
				t_statistic[i] = (b.M[i][0] - indexes_b0.fix[0]) / VARB[i];
			}
		}
	}
	else { alert("No correct input of index matrix!"); }
	//console.log(t_statistic);
	//console.log('b:' + b)
	var t_stat_abs = new Array();
	for (i = 0; i < t_statistic.length; i++) { t_stat_abs[i] = Math.abs(t_statistic[i]); }
	//console.log(t_stat_abs);
	var N = regression.observations - regression.variables - 1;
	//console.log(N);
	var t_prob;
	function ARRTPROB(arr, n, m) {
		if (!TP) var TP = new Array();
		function TPV(arr, n, m) {
			if (m < arr.length) { TP[m] = parseFloat(euriklis.Distribution.t_Student_p(n, arr[m])); return TPV(arr, n, m + 1); }
			if (m == arr.length) { return TP; }
		}

		return TPV(arr, n, m);
	}
	t_prob = ARRTPROB(t_stat_abs, N, 0);
	//console.log(t_prob);
	//console.log(t_statistic);
	var indices = new Array(), _indices_ = new Array();
	if (indexes === 'all') {
		for (var ind = 0; ind < b.rows; ind++) {
			indices[ind] = ind;
		}
	}
	else { indices = indexes }
	//console.log(t_statistic);
	if (indexes_b0.fix) {
		for (var _ind = 0; _ind < indices.length; _ind++) {
			_indices_[_ind] = indexes_b0.fix[0];
		}
	}
	else {
		for (ind_ = 0; ind_ < indices.length; ind_++) {
			_indices_[ind_] = indexes_b0.set[ind_];
		}
	}
	for (i = 0; i < t_statistic.length; i++) {
		if (t_statistic[i] <= -t_Pinax) {
			t_leftHand_test[i] = { 'H': 'Ha', 'result': 'β<sub>' + indices[i] + '</sub> < ' + _indices_[i], 't_stat': t_statistic[i], 'T_Pinax': t_Pinax, 't_prob': t_prob[i] };
		}
		else {
			t_leftHand_test[i] = { 'H': 'H0', 'result': 'β<sub>' + indices[i] + '</sub> > ' + _indices_[i], 't_stat': t_statistic[i], 'T_Pinax': t_Pinax, 't_prob': t_prob[i] };
		}
		if (t_statistic[i] >= t_Pinax) {
			t_rightHand_test[i] = { 'H': 'Ha', 'result': 'β<sub>' + indices[i] + '</sub> > ' + _indices_[i], 't_stat': t_statistic[i], 'T_Pinax': t_Pinax, 't_prob': t_prob[i] };
		}
		else { t_rightHand_test[i] = { 'H': 'H0', 'result': 'β<sub>' + indices[i] + '</sub> < ' + _indices_[i], 't_stat': t_statistic[i], 'T_Pinax': t_Pinax, 't_prob': t_prob[i] }; }
		if (Math.abs(t_statistic[i]) >= t_PinaxDual) {
			t_dual_test[i] = { 'H': 'Ha', 'result': 'β<sub>' + indices[i] + '</sub> ≠ ' + _indices_[i], 't_stat': t_statistic[i], 'T_Pinax': t_PinaxDual, 't_prob': t_prob[i] };
		}
		else { t_dual_test[i] = { 'H': 'H0', 'result': 'β<sub>' + indices[i] + '</sub> = ' + _indices_[i], 't_stat': t_statistic[i], 'T_Pinax': t_PinaxDual, 't_prob': t_prob[i] }; }
	}
	t_test_output = { 'one-sided upper tail test': t_rightHand_test, 'one-sided lower tail test': t_leftHand_test, 'two-sided test': t_dual_test };//console.log(t_test_output);
	return t_test_output;
}
euriklis.Econometrics.TestHypothesis.F = new Object();
euriklis.Econometrics.TestHypothesis.F.All = function (X, Y, e_t, sign, T) {
	var B = euriklis.Econometrics.OLS(X, Y, e_t, T);
	var b = B.Coefficients;
	var observations = B.observations;
	var F_stat = B.F_stat;
	var F_test_output = new Object();
	console.log('F - stat: ' + F_stat);
	console.log('b-rows: ' + b.rows);
	console.log('observations - variables: ' + (observations - b.rows));
	var F_Pinax = euriklis.Distribution.F_Fisher(B.variables + 1, (B.observations - B.variables - 1), sign, 0.000001, 'X');
	if (F_stat >= F_Pinax) { F_test_output = { 'H': "Ha", 'result': 'β ≠ 0', 'F': F_stat, 'F_Pinax': F_Pinax, 'F_prob': euriklis.Distribution.F_Fisher_p(F_stat, b.rows, observations - b.rows) }; }
	else { F_test_output = { 'H': "H0", 'result': 'β = 0', 'F': F_stat, 'F_Pinax': F_Pinax, 'F_prob': euriklis.Distribution.F_Fisher_p(F_stat, b.rows, observations - b.rows) }; }
	return F_test_output;
}
//Testing some coefficients or test Tintner.
euriklis.Econometrics.TestHypothesis.F.Some_b = function (X, Y, fse_t, m, sign, T) {
	//We create matrices with a first m variables:
	X = euriklis.Mathematics.cloning(X).M;
	var Xm = new Array();
	var n1 = euriklis.Econometrics.OLS(X, Y, fse_t).observations;
	for (i = 0; i < n1; i++) {
		Xm[i] = new Array();
		for (j = 0; j < m; j++) { Xm[i][j] = X[i][j]; }
	}
	//Estimate the two regressions
	var REG1 = euriklis.Econometrics.OLS(X, Y, fse_t, T);
	var observations = REG1.observations;
	var variables = REG1.variables;
	var REG1_R = REG1.R;
	var REG2_R = euriklis.Econometrics.OLS(Xm, Y, fse_t, T).R;
	//F=(Ru^2 - Rr^2)/(1-Ru^2)*(observ - variables-1)/(variables - m).
	F_stat = ((REG1_R - REG2_R) / (1 - REG1_R)) * ((observations - variables - 1) / (variables - m));
	var F_Pinax = euriklis.Distribution.F_Fisher((variables - m), (observations - variables - 1), sign, 0.000001, 'X');
	var F_test_output = new Object();
	if (F_stat >= F_Pinax) { F_test_output = { 'H': "Ha", 'result': 'β ≠ 0', 'F': F_stat, 'F_Pinax': F_Pinax, 'F_prob': euriklis.Distribution.F_Fisher_p(F_stat, variables + 1, observations - variables - 1) }; }
	else { F_test_output = { 'H': "H0", 'result': 'β = 0', 'F': F_stat, 'F_Pinax': F_Pinax, 'F_prob': euriklis.Distribution.F_Fisher_p(F_stat, variables + 1, observations - variables - 1) }; }
	return F_test_output;
}
euriklis.Econometrics.TestHypothesis.FirstChow = function (X, Y, e_t, Critical_Observation, sign, T) {
	/*This test contains two stages.Firs we have to test if the dispersions
	 *of the two regressions are equal (H0) or not(Ha) and if the result of the 
	 *first test is H0 we continue with the First Chow test.
	 */
	//We get the ESS_0 of OLS(x,y,e_t) and the number of the variables.
	X = euriklis.Mathematics.cloning(X);
	Y = euriklis.Mathematics.cloning(Y);
	var B = euriklis.Econometrics.OLS(X, Y, e_t, T);
	var ESS_0 = parseFloat(B.ESS);
	//k-->variables
	var k = B.variables;
	//n-->observations
	var n = B.observations;
	//We devide all the observational material in two parts, lets from 0 (zero) to p=Critical_Observation and from p+1 to n
	var p = typeof T === 'undefined' ? Critical_Observation :
		T.indexOf(Critical_Observation);
	//the X[p] index.
	var q = n - p - 1;//the length of the second matrix
	//then we create the matrices y(p+1) and x(p+1*variables) and y(q) and x(q*variables) where q = n - p -1.
	var yp = new Array();
	var xp = new Array();
	var yq = new Array();
	var xq = new Array();
	//console.log(p + ',' + q);
	for (i = 0; i <= p; i++) {
		yp[i] = new Array();
		xp[i] = new Array();
		for (j = 0; j < Y.M[i].length; j++) { yp[i][j] = Y.M[i][j]; }
		for (h = 0; h < k; h++) { xp[i][h] = X.M[i][h]; }
	}
	for (i = 0; i < q; i++) {
		yq[i] = new Array();
		xq[i] = new Array();
		for (w = 0; w < Y.M[i].length; w++) { yq[i][w] = Y.M[i + p + 1][w]; }
		for (z = 0; z < k; z++) { xq[i][z] = X.M[i + p + 1][z]; }

	}
	//After that we have to get the the ESS_1 and ESS_2 from the estimations of the two couples.
	var ESS_1 = parseFloat(euriklis.Econometrics.OLS(xp, yp, e_t).ESS);
	var ESS_2 = parseFloat(euriklis.Econometrics.OLS(xq, yq, e_t).ESS);
	//Computing the F statistic for equality of the dispersions:
	var F_s, F_Pinax_s;
	if (p - k > 0 && q - k - 1 > 0) {
		F_s = ((ESS_1) / (p - k)) / ((ESS_2 / q - k - 1));
		F_Pinax_s = euriklis.Distribution.F_Fisher((p - k), (q - k - 1), sign, 0.000001, 'X');
	}
	else {
		F_s = false;
		F_Pinax_s = false;
		//console.log(F_s);
		//console.log(F_Pinax_s);
	}
	//First stage test: see Αναστάσιος Κάτος, Οικονομετρία, Θεωρία και εφαρμογές,p.355 formulas 5.6.36-37
	var FirstChow_output = new Object();
	FirstChow_output.Breakpoint = Critical_Observation;
	FirstChow_output.Dispersion_Test_F = new Object();
	FirstChow_output.Dispersion_Test_Chi = new Object();
	if (F_s != false && F_Pinax_s != false) {
		if (F_s >= F_Pinax_s) {
			FirstChow_output.Dispersion_Test_F = { 'H': "Ha", 'result': 'σ<sub>1</sub> ≠ σ<sub>2</sub> ≠ 0', 'F': F_s, 'F_Pinax': F_Pinax_s, 'F_prob': euriklis.Distribution.F_Fisher_p(F_s, p - k, q - k - 1) };
		}
		else {
			FirstChow_output.Dispersion_Test_F = { 'H': "H0", 'result': 'σ<sub>1</sub> = σ<sub>2</sub> = 0', 'F': F_s, 'F_Pinax': F_Pinax_s, 'F_prob': euriklis.Distribution.F_Fisher_p(F_s, p - k, q - k - 1) };
		}
	}
	else { FirstChow_output.Dispersion_Test_F = { error: 'it is no possible to exclude test.' }; }
	//Computing of the F statistic: F = (ESS_0 - ESS_1 - ESS_2)/(ESS_1+ESS_2)*((p+q-2*(variables+1))/(variables+1))
	var F_num_part = (ESS_0 - ESS_1 - ESS_2) / (k + 1);
	var F_devide_part = (ESS_1 + ESS_2) / (n - 2 * (k + 1));
	var F_stat;
	if (F_num_part / F_devide_part > 0) {
		F_stat = F_num_part / F_devide_part;
	}
	else { F_stat = false; }
	var F_Pinax;
	if (n - 2 * (k + 1) > 0) {
		F_Pinax = euriklis.Distribution.F_Fisher((k + 1), (n - 2 * (k + 1)), sign, 0.000001, 'X');
	}
	else { F_Pinax = false; }
	// if F_stat >= F_Pinax(variables+1,n - 2(variables+1),sign)|---> Ha, else H0.
	//Computing the chi-square statistic for the equality of the dispersions: see 
	//Αναστάσιος Κάτος, Οικονομετρία, Θεωρία και εφαρμογές,p.295 formulas 4.13.43-44
	var chi_stat;
	if (F_stat) {
		chi_stat = (k + 1) * F_stat;
	}
	else { chi_stat = false; }
	var chi_pinax = euriklis.Distribution.Chi_square_chi(k + 1, sign, 0.000001, 'X');
	var chi_prob;
	if (chi_stat) {
		chi_prob = euriklis.Distribution.Chi_square_p(k + 1, chi_stat);
	}
	else { chi_prob = false; }
	if (!chi_stat && !chi_prob) {
		FirstChow_output.Dispersion_Test_Chi = { error: 'It is no possible to exclude dispersion test.' };
	}
	else {
		if (chi_stat > chi_pinax) {
			FirstChow_output.Dispersion_Test_Chi = { H: 'Ha', result: 'σ<sub>1</sub> ≠ σ<sub>2</sub> ≠ 0', chi_sq_stat: chi_stat, chi_sq_prob: chi_prob, chi_sq_pinax: chi_pinax };
		}
		else {
			FirstChow_output.Dispersion_Test_Chi = { H: 'H0', result: 'σ<sub>1</sub> = σ<sub>2</sub> = 0', chi_sq_stat: chi_stat, chi_sq_pinax: chi_pinax, chi_sq_prob: chi_prob, };
		}
	}
	FirstChow_output.Chow = new Object();
	if (F_stat && F_Pinax) {
		if (F_stat >= F_Pinax) {
			FirstChow_output.Chow = { 'H': "Ha", 'result': 'β ≠ γ', 'F': F_stat, 'F_Pinax': F_Pinax, 'F_prob': euriklis.Distribution.F_Fisher_p(F_stat, k + 1, (n - 2 * (k + 1))) };
		}
		else {
			FirstChow_output.Chow = { 'H': "H0", 'result': 'β = γ', 'F': F_stat, 'F_Pinax': F_Pinax, 'F_prob': euriklis.Distribution.F_Fisher_p(F_stat, k + 1, (n - 2 * (k + 1))) };
		}
	}
	else {
		FirstChow_output.Chow = { error: 'it is no possible to exclude The Chow test.' };
	}
	FirstChow_output['First Regression'] = new Object();
	FirstChow_output['First Regression'] = euriklis.Econometrics.OLS(xp, yp, e_t);
	FirstChow_output['Second Regression'] = new Object();
	FirstChow_output['Second Regression'] = euriklis.Econometrics.OLS(xq, yq, e_t);
	FirstChow_output['Full Regression'] = new Object();
	FirstChow_output['Full Regression'] = B;
	return FirstChow_output;
}
euriklis.Econometrics.TestHypothesis.SecondChow = function (X, Y, e_t, m, sign, T) {
	/*This test contains two stages:
	 *First we test if the dispersions are equal(H0) or not(Ha)
	 *if the result is H0 we make the Second Chow test.
	 */
	X = euriklis.Mathematics.cloning(X);
	Y = euriklis.Mathematics.cloning(Y);
	var B = euriklis.Econometrics.OLS(X, Y, e_t, T);
	var b_1 = B.Coefficients;
	var ESS_0 = parseFloat(B.ESS);
	//k-->variables
	var k = B.variables;
	//n-->observations
	var n = B.observations;
	//Creating the Array with m+1 observations:
	var xm = new Array();
	var ym = new Array();
	var Forecast = euriklis.deepCopy(m);
	m = typeof T === 'undefined' ? m : T.indexOf(m);
	for (i = 0; i <= m; i++) {
		xm[i] = new Array();
		ym[i] = new Array();
		for (j = 0; j < k; j++) { xm[i][j] = X.M[i][j]; }
		for (l = 0; l < Y.M[i].length; l++) { ym[i][l] = Y.M[i][l]; }
	}
	var SecondChow_output = new Object();
	SecondChow_output.Forecast = Forecast;
	SecondChow_output.Dispersion_Test_HF = new Object();
	var ESS_1 = parseFloat(euriklis.Econometrics.OLS(xm, ym, e_t).ESS);
	var Estimated_Y_2 = B.x.times(b_1);
	var Minus_Est_Y_2 = Estimated_Y_2.times(-1);
	var e_2 = Y.plus(Minus_Est_Y_2);
	var Te_2 = e_2.transpose();
	var ESS_2 = Te_2.times(e_2);
	//Hendry test (1990) for equality of the dispersions of two periods: Econometrix, Katos p.356.
	var HF, ChiSq;
	if (m - k > 0) {
		HF = (ESS_2) * Math.pow((ESS_1 / (m - k)), (-1));
	}
	else { HF = false; }
	if (n - m - 1 > 0) {
		ChiSq = euriklis.Distribution.Chi_square_chi(n - m - 1, sign, 0.000001, 'X');
	}
	else { ChiSq = false; }
	if (HF && ChiSq) {
		if (HF > ChiSq) {
			SecondChow_output.Dispersion_Test_HF = { 'H': 'Ha', 'result': 'σ<sub>1</sub> ≠ σ<sub>2</sub>', 'HF': HF, 'chi_sq_pinax': ChiSq, 'ESS_2': ESS_2, chi_sq_prob: euriklis.Distribution.Chi_square_p(n - m - 1, HF) };
		}
		else {
			SecondChow_output.Dispersion_Test_HF = { 'H': 'H0', 'result': 'σ<sub>1</sub> = σ<sub>2</sub>', 'HF': HF, 'chi_sq_pinax': ChiSq, 'ESS_2': ESS_2, chi_sq_prob: euriklis.Distribution.Chi_square_p(n - m - 1, HF) };
		}
	}
	else {
		SecondChow_output.Dispersion_Test_HF = { error: 'it is no possible to exclude the HF dispersion test.' };
	}
	SecondChow_output.Chow = new Object();
	//F-statistic:
	var F_stat, F_Pinax;
	if (n - m - 1 > 0 && m - k > 0) {
		F_stat = ((ESS_0 - ESS_1) / (n - m - 1)) / (ESS_1 / (m - k));
		F_Pinax = euriklis.Distribution.F_Fisher((n - m - 1), (m - k), sign, 0.00001, 'X');
		//Chi square statistic
		SecondChow_output.Dispersion_Test_Chi = new Object();
		var chi_stat = (n - m - 1) * F_stat;
		var chi_pinax = euriklis.Distribution.Chi_square_chi(n - m - 1, sign, 0.000001, 'X');
		var chi_prob = euriklis.Distribution.Chi_square_p(n - m - 1, chi_stat);
		if (chi_stat > chi_pinax) {
			SecondChow_output.Dispersion_Test_Chi = { H: 'Ha', 'result': 'σ<sub>1</sub> ≠ σ<sub>2</sub>', 'chi_sq_stat': chi_stat, 'chi_sq_prob': chi_prob, chi_sq_pinax: chi_pinax };
		}
		else {
			SecondChow_output.Dispersion_Test_Chi = { H: 'H0', 'result': 'σ<sub>1</sub> = σ<sub>2</sub>', 'chi_sq_stat': chi_stat, 'chi_sq_prob': chi_prob, chi_sq_pinax: chi_pinax };
		}
	}
	else {
		SecondChow_output.Dispersion_Test_Chi = { error: 'it is no possible to exclude Chi square test.' };
		F_stat = false;
		F_Pinax = false;
	}
	if (F_stat && F_Pinax) {
		if (F_stat >= F_Pinax) {
			SecondChow_output.Chow = { 'H': "Ha", 'result': 'β ≠ γ', 'F': F_stat, 'F_Pinax': F_Pinax, 'F_prob': euriklis.Distribution.F_Fisher_p(F_stat, n - m - 1, (m - k)) };
		}
		else {
			SecondChow_output.Chow = { 'H': "H0", 'result': 'β = γ', 'F': F_stat, 'F_Pinax': F_Pinax, 'F_prob': euriklis.Distribution.F_Fisher_p(F_stat, n - m - 1, (m - k)) };
		}
	}
	else {
		SecondChow_output.Chow = { error: 'it is no possible to exclude the Second Chow test.' };
	}
	SecondChow_output['First Regression'] = new Object();
	SecondChow_output['Full Regression'] = new Object();
	SecondChow_output['First Regression'] = euriklis.Econometrics.OLS(xm, ym, e_t);
	SecondChow_output['Full Regression'] = B;
	return SecondChow_output;
}
euriklis.Econometrics.TestHypothesis.DW = function (X, Y, e_t, Tn) {
	var reg = euriklis.Econometrics.OLS(X, Y, e_t, Tn);
	var DW = reg.DW;
	var DWl = euriklis.Distribution.Durbin_Watson(reg.observations, reg.x.M[0].length, 0);
	var DWu = euriklis.Distribution.Durbin_Watson(reg.observations, reg.x.M[0].length, 1);
	output_DW = { 'DW upper tail': [], 'DW lower tail': [], 'DW two tail': [], 'DW': DW, 'DWl': DWl, 'DWu': DWu };
	var ut = 'DW upper tail', lt = 'DW lower tail', tt = 'DW two tail';
	if (DW < DWl) {
		output_DW[ut][0] = 'Ha';
		output_DW[ut][1] = 'ρ > 0';
	}
	if (DWu < DW) {
		output_DW[ut][0] = 'H0';
		output_DW[ut][1] = 'ρ ≤ 0';
	}
	if (DWl <= DW && DW <= DWu) {
		output_DW[ut][0] = 'NOT';
		output_DW[ut][1] = 'ρ ?>? 0';
	}
	if ((4 - DWl) < DW) {
		output_DW[lt][0] = 'Ha';
		output_DW[lt][1] = 'ρ < 0';
	}
	if ((DW) < (4 - DWu)) {
		output_DW[lt][0] = 'H0';
		output_DW[lt][1] = 'ρ ≥ 0';
	}
	if ((4 - DWu) <= (DW) && DW <= (4 - DWl)) {
		output_DW[lt][0] = 'NOT';
		output_DW[lt][1] = 'ρ ?<? 0';
	}
	if ((DWu) <= (DW) && DW <= (4 - DWu)) {
		output_DW[tt][0] = 'H0';
		output_DW[tt][1] = 'ρ = 0';
	}
	if (((DWl) <= (DW) && DW <= (DWu)) || ((4 - DWu) <= DW && DW <= (4 - DWl))) {
		output_DW[tt][0] = 'NOT';
		output_DW[tt][1] = 'ρ ?=? 0';
	}
	if ((DW < DWl) || ((4 - DWl) < DW)) {
		output_DW[tt][0] = 'Ha';
		output_DW[tt][1] = 'ρ ≠ 0';
	}
	return output_DW;
}
euriklis.Econometrics.TestHypothesis.ChoiceLinearOrLogarithmicModelCriteria = new Object();
euriklis.Econometrics.TestHypothesis.ChoiceLinearOrLogarithmicModelCriteria.BoxCox = function (X, Y) {
	//Computing the geometric mean of Y
	var geometricMeanY = 1;
	X = euriklis.Mathematics.cloning(X);
	Y = euriklis.Mathematics.cloning(Y);
	for (i = 0; i < Y.rows; i++) geometricMeanY *= Y.M[i][0];
	geometricMeanY = Math.pow(geometricMeanY, (1 / Y.rows));
	//test://console.log(geometricMeanY);
	//creating the new Y matrix:
	var YBoxCox = new Array();
	for (i = 0; i < Y.rows; i++) {
		YBoxCox[i] = new Array();
		YBoxCox[i][0] = Y.M[i][0] / geometricMeanY;
	}
	var ESSLinear = parseFloat(euriklis.Econometrics.OLS(X, YBoxCox, 0).ESS);
	var ESSLogarithmic = parseFloat(euriklis.Econometrics.OLS(X, YBoxCox, 2).ESS);
	var H = '';
	if (ESSLinear > ESSLogarithmic) { H = 'Ha'; }
	else { if (ESSLinear < ESSLogarithmic) H = 'H0'; }
	BoxCoxOutput = { H: H, result: H === 'H0' ? 'Linear' : 'Logarithmic', 'ESS of the linear estimation': ESSLinear, 'ESS of the logarithmic estimation': ESSLogarithmic }
	return BoxCoxOutput;
}
euriklis.Econometrics.TestHypothesis.ChoiceLinearOrLogarithmicModelCriteria.MWD = function (X, Y, sign) {
	X = euriklis.Mathematics.cloning(X);
	Y = euriklis.Mathematics.cloning(Y);
	//estimations of the linear and logarithmic functions:
	var Y1 = euriklis.Econometrics.OLS(X, Y, 0);
	var Y2 = euriklis.Econometrics.OLS(X, Y, 2);
	//y linear and logarithmic estimation declaration:
	var yLinearEstimation = new Array();
	var yLogarithmicEstimation = new Array();
	for (i = 0; i < Y.rows; i++) {
		//y linear estimation:
		yLinearEstimation[i] = new Array();
		yLinearEstimation[i][0] = Y1.y.M[i][0] - Y1.e.M[i][0];
		//y logarithmic estimation:
		yLogarithmicEstimation[i] = new Array();
		yLogarithmicEstimation[i][0] = Y2.y.M[i][0] - Y2.e.M[i][0];
	}
	//z0 matrix variable:
	var z0 = new Array();
	for (i = 0; i < Y.rows; i++)z0[i] = Math.log(yLinearEstimation[i][0]) - yLogarithmicEstimation[i][0];
	//za matrix variable:
	var za = new Array();
	for (i = 0; i < Y.rows; i++)za[i] = parseFloat(Math.exp(yLogarithmicEstimation[i][0]) - yLinearEstimation[i][0]);
	//adding the z0 and za to the x matrices:
	var x0 = new Array()
	var xa = new Array();
	x0 = euriklis.Mathematics.cloning(X).M;
	for (i = 0; i < X.rows; i++) {
		xa[i] = new Array();
		for (j = 0; j < X.columns; j++)xa[i][j] = Math.log(X.M[i][j]);
	}
	for (i = 0; i < X.rows; i++) {
		x0[i].push(z0[i]);
		xa[i].push(za[i]);
	}
	var ya = new Array();
	for (i = 0; i < Y.rows; i++) {
		ya[i] = new Array();
		for (j = 0; j < Y.columns; j++)ya[i][j] = Math.log(Y.M[i][j]);
	}
	//estimation of H0 model:
	var M0 = euriklis.Econometrics.OLS(x0, Y, 0);
	var Ma = euriklis.Econometrics.OLS(xa, ya, 0);
	console.log(x0);
	console.log(xa);
	var tTestM0 = euriklis.Econometrics.TestHypothesis.t(x0, Y, 0, [x0[0].length], { 'set': [0] }, sign)['two-sided test'][0];
	var tTestMa = euriklis.Econometrics.TestHypothesis.t(xa, ya, 0, [xa[0].length], { 'set': [0] }, sign)['two-sided test'][0];
	function resultTest(tTestM0, tTestMa) {
		var res = '';
		if (tTestM0.H == 'Ha' && tTestMa.H == 'H0') { res = "Ha"; }
		else {
			if (tTestM0.H == "H0" && tTestMa.H == "Ha") { res = "H0"; }
			else {
				if (tTestM0.H == "Ha" && tTestMa.H == "Ha") { res = "H"; }
				else res = "H";
			}
		}
		return res;
	}
	MWDOutput = {
		H: resultTest(tTestM0, tTestMa),
		'Coefficients of linear model': Y1.Coefficients,
		'Coefficients of logarithmical model': Y2.Coefficients,
		'Coefficients of expanded linear model': M0.Coefficients,
		'Coefficients of expanded logarithmical model': Ma.Coefficients,
		't-Test expanded linear coefficient': tTestM0,
		't-Test expanded log coefficient': tTestMa
	};
	return MWDOutput;
}
euriklis.Econometrics.TestHypothesis.ChoiceLinearOrLogarithmicModelCriteria.BM = function (X, Y, sign) {
	//estimations of the linear and logarithmic functions:
	X = euriklis.Mathematics.cloning(X);
	Y = euriklis.Mathematics.cloning(Y);
	var Y1 = euriklis.Econometrics.OLS(X, Y, 0);
	var Y2 = euriklis.Econometrics.OLS(X, Y, 2);
	//y linear and logarithmic estimation declaration:
	var yLinearEstimation = new Array();
	var yLogarithmicEstimation = new Array();
	for (i = 0; i < Y.rows; i++) {
		//y linear estimation:
		yLinearEstimation[i] = new Array();
		yLinearEstimation[i][0] = Y1.y.M[i][0] - Y1.e.M[i][0];
		//y logarithmic estimation:
		yLogarithmicEstimation[i] = new Array();
		yLogarithmicEstimation[i][0] = Y2.y.M[i][0] - Y2.e.M[i][0];
	}
	//declaring of z and za matrix variables:
	var z0 = new Array();
	for (i = 0; i < Y.rows; i++) {
		z0[i] = new Array();
		z0[i][0] = Math.log(yLinearEstimation[i][0]);
	}
	var za = new Array();
	for (i = 0; i < Y.rows; i++) {
		za[i] = new Array();
		za[i][0] = Math.exp(yLogarithmicEstimation[i][0]);
	}
	//residuals of the z0,a estimation:
	var eBM = euriklis.Econometrics.OLS(X, z0, 0);
	var xa = new Array();
	x0 = euriklis.Mathematics.cloning(X);
	for (i = 0; i < X.rows; i++) {
		xa[i] = new Array();
		for (j = 0; j < X.colomns; j++)xa[i][j] = Math.log(X.M[i][j]);
	}
	var uBM = euriklis.Econometrics.OLS(xa, za, 0);
	//expanded x matrices:
	for (i = 0; i < X.rows; i++) {
		x0.M[i].push(eBM.e.M[i][0]);
		xa[i].push(uBM.e.M[i][0]);
	}
	var ya = new Array();
	console.log('x0:' + x0)
	console.log('xa:' + xa)
	console.log('z0' + z0)
	console.log('za' + za)
	console.log('z0' + z0)
	for (i = 0; i < Y.rows; i++) {
		ya[i] = new Array();
		for (j = 0; j < Y.columns; j++)ya[i][j] = Math.log(Y.M[i][j]);
	}
	console.log('uBM' + uBM)
	console.log('eBM' + eBM)
	var ExpEst1 = euriklis.Econometrics.OLS(x0, Y, 0);
	var ExpEst2 = euriklis.Econometrics.OLS(xa, ya, 0);
	console.log('twra x0:');
	console.log(x0);
	var BMe = euriklis.Econometrics.TestHypothesis.t(x0, Y, 0, [x0.columns - 1], { 'set': [0] }, sign)['two-sided test'][0];
	var BMu = euriklis.Econometrics.TestHypothesis.t(xa, ya, 0, [xa[0].length - 1], { 'set': [0] }, sign)['two-sided test'][0];
	function resultTest(tTestM0, tTestMa) {
		var res = '';
		if (BMe.H == 'Ha' && BMu.H == 'H0') { res = "Ha"; }
		else {
			if (BMe.H == "H0" && BMu.H == "Ha") { res = "H0"; }
			else {
				if (BMe.H == "Ha" && BMu.H == "Ha") { res = "H"; }
				else res = "H";
			}
		}
		return res;
	}
	var BMOutput =
	{
		H: resultTest(BMe, BMu),
		'coefficients of linear model': Y1.Coefficients,
		'coefficients of logarithmical model': Y2.Coefficients,
		'coefficients of expanded linear model': ExpEst1.Coefficients,
		'coefficients of expanded logarithmical model': ExpEst2.Coefficients,
		'coefficients of auxiliary log-linear model': eBM.Coefficients,
		'coefficients of auxiliary linear-log model': uBM.Coefficients,
		't-Test expanded linear coefficient': BMe,
		't-Test expanded log coefficient': BMu
	};
	return BMOutput;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity = new Object();
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.BartlettAsymptotic = function (Y, breakpointCoefArr, sign, T) {
	function breakpoint(brp, T) {
		/*Breakpoint array when the T matrix exists*/
		var i, brp = euriklis.Mathematics.cloning(brp).M;
		for (i = 0; i < brp.length; i++) {
			brp[i] = T.indexOf(brp[i]);
		}
	}
	Y = euriklis.Mathematics.cloning(Y).M;
	breakpointCoefArr = (typeof T === 'undefined') ? euriklis.Mathematics.cloning(breakpointCoefArr).M :
		breakpoint(breakpointCoefArr, T);
	var n = Y.length;
	//console.log('n:'+n);
	var nk = new Array();
	for (i = 0; i <= breakpointCoefArr.length; i++) {
		if (i == 0) { nk[i] = breakpointCoefArr[i] + 1; }
		else {
			if (i < breakpointCoefArr.length && i > 0) {
				nk[i] = breakpointCoefArr[i] - breakpointCoefArr[i - 1];
			}
			else {
				if (i == breakpointCoefArr.length) {
					nk[i] = n - breakpointCoefArr[i - 1] - 1;
				}
			}
		}
	}
	//console.log('nk:'+nk);
	var sk = new Array();
	var skarray = new Array();
	var bp = new Array();
	bp = euriklis.Mathematics.cloning(breakpointCoefArr).M;
	bp.push(n - 1);
	var zeroPoint = 0;
	for (i = 0; i < nk.length; i++) {
		skarray[i] = new Array();
		for (j = zeroPoint; j <= bp[i]; j++) {
			skarray[i][j - zeroPoint] = parseFloat(Y[j][0]);
		}
		zeroPoint = bp[i] + 1;
		//console.log('skarray['+i +']'+skarray[i]);
	}
	for (k = 0; k < skarray.length; k++) {
		sk[k] = euriklis.Econometrics.VAR(skarray[k]);
	}
	//console.log(euriklis.Econometrics.VAR(skarray[2]));
	//console.log(skarray);
	//console.log('sk:'+sk);
	var s = 0;
	for (i = 0; i < sk.length; i++) { s += (nk[i]) * sk[i]; }
	s /= n;
	var nklogsksum = 0;
	for (i = 0; i < sk.length; i++)nklogsksum += nk[i] * Math.log(sk[i]);
	var M = n * Math.log(s) - nklogsksum;
	//console.log('s:'+s);
	//console.log('M:' + M);
	//right part sum:
	var rpsum = 0;
	for (i = 0; i < nk.length; i++)rpsum += (1 / (nk[i]));
	rpsum -= (nk.length) / (n);
	var C = (rpsum / (3 * (nk.length - 1))) + 1;
	//console.log('C:'+ C);
	var bartlett = M / C;
	var chi_stat = euriklis.Distribution.Chi_square_chi(nk.length - 1, sign, 0.000001, 'X');
	var H = '';
	(bartlett > chi_stat) ? H = 'Ha' : H = 'H0';
	//console.log('bartlett:'+bartlett);
	var BartlettOutput = new Object();
	BartlettOutput.H = H;
	BartlettOutput.bartlett = bartlett;
	BartlettOutput.M = M; BartlettOutput.C = C;
	BartlettOutput.chi_sq_stat = chi_stat;
	return BartlettOutput;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Spearman = function (X, Y, estMeth, index, significance) {
	X = euriklis.Mathematics.cloning(X).M;
	Y = euriklis.Mathematics.cloning(Y).M;
	var e = euriklis.Econometrics.OLS(X, Y, estMeth).e.transpose().M;
	var abse = new Array();
	for (i = 0; i < e[0].length; i++)abse[i] = Math.abs(e[0][i]);
	var xj = new Array();
	for (i = 0; i < X.length; i++) { xj[i] = X[i][index]; }
	Xji = xj.toMatrix().mergeSort().spearmanRank;
	var ei = abse.toMatrix().mergeSort().spearmanRank;
	var d = new Array();
	for (i = 0; i < X.length; i++) { d[i] = Xji[i] - ei[i]; }
	var rs = 0;
	for (i = 0; i < d.length; i++) { rs += d[i] * d[i]; }
	//console.log(rs);
	rs *= 6 / (d.length * d.length * d.length - d.length);
	rs = 1 - rs;
	//date of vizitation:16.01.2016,source:http://onlinelibrary.wiley.com/doi/10.1002/9781118342978.app2/pdf
	//type of record: SpearmanCriticalValues.df[''] = {sign:{{0.2:,0.1:,0.05:,0.02:,0.01:,0.001:}}
	SpearmanCriticalValues = new Object();
	SpearmanCriticalValues.df = new Object();
	SpearmanCriticalValues.df['2'] = { sign: { 0.2: 1.000, 0.1: 1.000 } };
	SpearmanCriticalValues.df['3'] = { sign: { 0.2: 0.800, 0.1: 0.900, 0.05: 1.000, 0.02: 1.000 } };
	SpearmanCriticalValues.df['4'] = { sign: { 0.2: 0.657, 0.1: 0.829, 0.05: 0.886, 0.02: 0.943, 0.01: 1.000 } };
	SpearmanCriticalValues.df['5'] = { sign: { 0.2: 0.571, 0.1: 0.714, 0.05: 0.786, 0.02: 0.893, 0.01: 0.929, 0.001: 1.000 } };
	SpearmanCriticalValues.df['6'] = { sign: { 0.2: 0.524, 0.1: 0.643, 0.05: 0.738, 0.02: 0.833, 0.01: 0.881, 0.001: 0.976 } };
	SpearmanCriticalValues.df['7'] = { sign: { 0.2: 0.483, 0.1: 0.600, 0.05: 0.700, 0.02: 0.783, 0.01: 0.833, 0.001: 0.933 } };
	SpearmanCriticalValues.df['8'] = { sign: { 0.2: 0.455, 0.1: 0.564, 0.05: 0.648, 0.02: 0.745, 0.01: 0.794, 0.001: 0.903 } };
	SpearmanCriticalValues.df['9'] = { sign: { 0.2: 0.427, 0.1: 0.536, 0.05: 0.618, 0.02: 0.709, 0.01: 0.755, 0.001: 0.873 } };
	SpearmanCriticalValues.df['10'] = { sign: { 0.2: 0.406, 0.1: 0.503, 0.05: 0.587, 0.02: 0.678, 0.01: 0.727, 0.001: 0.846 } };
	SpearmanCriticalValues.df['11'] = { sign: { 0.2: 0.385, 0.1: 0.484, 0.05: 0.560, 0.02: 0.648, 0.01: 0.703, 0.001: 0.824 } };
	SpearmanCriticalValues.df['12'] = { sign: { 0.2: 0.367, 0.1: 0.464, 0.05: 0.538, 0.02: 0.626, 0.01: 0.679, 0.001: 0.802 } };
	SpearmanCriticalValues.df['13'] = { sign: { 0.2: 0.354, 0.1: 0.446, 0.05: 0.521, 0.02: 0.604, 0.01: 0.654, 0.001: 0.779 } };
	SpearmanCriticalValues.df['14'] = { sign: { 0.2: 0.341, 0.1: 0.429, 0.05: 0.503, 0.02: 0.582, 0.01: 0.635, 0.001: 0.762 } };
	SpearmanCriticalValues.df['15'] = { sign: { 0.2: 0.328, 0.1: 0.414, 0.05: 0.485, 0.02: 0.566, 0.01: 0.615, 0.001: 0.748 } };
	SpearmanCriticalValues.df['16'] = { sign: { 0.2: 0.317, 0.1: 0.401, 0.05: 0.472, 0.02: 0.550, 0.01: 0.600, 0.001: 0.728 } };
	SpearmanCriticalValues.df['17'] = { sign: { 0.2: 0.309, 0.1: 0.391, 0.05: 0.460, 0.02: 0.535, 0.01: 0.584, 0.001: 0.712 } };
	SpearmanCriticalValues.df['18'] = { sign: { 0.2: 0.299, 0.1: 0.380, 0.05: 0.447, 0.02: 0.520, 0.01: 0.570, 0.001: 0.696 } };
	SpearmanCriticalValues.df['19'] = { sign: { 0.2: 0.292, 0.1: 0.370, 0.05: 0.435, 0.02: 0.508, 0.01: 0.556, 0.001: 0.681 } };
	SpearmanCriticalValues.df['20'] = { sign: { 0.2: 0.284, 0.1: 0.361, 0.05: 0.425, 0.02: 0.496, 0.01: 0.544, 0.001: 0.667 } };
	SpearmanCriticalValues.df['21'] = { sign: { 0.2: 0.278, 0.1: 0.353, 0.05: 0.415, 0.02: 0.486, 0.01: 0.532, 0.001: 0.654 } };
	SpearmanCriticalValues.df['22'] = { sign: { 0.2: 0.271, 0.1: 0.344, 0.05: 0.406, 0.02: 0.476, 0.01: 0.521, 0.001: 0.642 } };
	SpearmanCriticalValues.df['23'] = { sign: { 0.2: 0.265, 0.1: 0.337, 0.05: 0.398, 0.02: 0.466, 0.01: 0.511, 0.001: 0.630 } };
	SpearmanCriticalValues.df['24'] = { sign: { 0.2: 0.259, 0.1: 0.331, 0.05: 0.390, 0.02: 0.457, 0.01: 0.501, 0.001: 0.619 } };
	SpearmanCriticalValues.df['25'] = { sign: { 0.2: 0.255, 0.1: 0.324, 0.05: 0.382, 0.02: 0.448, 0.01: 0.491, 0.001: 0.608 } };
	SpearmanCriticalValues.df['26'] = { sign: { 0.2: 0.250, 0.1: 0.317, 0.05: 0.375, 0.02: 0.440, 0.01: 0.483, 0.001: 0.598 } };
	SpearmanCriticalValues.df['27'] = { sign: { 0.2: 0.245, 0.1: 0.312, 0.05: 0.368, 0.02: 0.433, 0.01: 0.475, 0.001: 0.589 } };
	SpearmanCriticalValues.df['28'] = { sign: { 0.2: 0.240, 0.1: 0.306, 0.05: 0.362, 0.02: 0.425, 0.01: 0.467, 0.001: 0.580 } };
	SpearmanCriticalValues.df['29'] = { sign: { 0.2: 0.236, 0.1: 0.301, 0.05: 0.356, 0.02: 0.418, 0.01: 0.459, 0.001: 0.571 } };
	SpearmanCriticalValues.df['30'] = { sign: { 0.2: 0.232, 0.1: 0.296, 0.05: 0.350, 0.02: 0.412, 0.01: 0.452, 0.001: 0.563 } };
	//spearman test:
	//critical value for comparison with --> rs, critical value from the test --> cvt:
	var cv, cvt;
	if (d.length >= 4 && d.length <= 10) {
		cv = SpearmanCriticalValues.df[d.length].sign[significance];
		cvt = rs;
	}
	if (d.length >= 10 && d.length <= 30) {
		cv = euriklis.Distribution.t_Student(d.length - 2, significance / 2, 0.000001, 'X');
		cvt = rs * Math.sqrt((d.length - 2) / (1 - (rs * rs)));
	}
	if (d.length > 30) {
		cv = euriklis.Distribution.Typical_Normal_z(significance / 2) * Math.pow(d.length - 1, -0.5);
		cvt = rs;
	}
	var H, result;
	cvt > cv ? (H = "Ha", result = 'Heteroscedasticity') :
		(H = 'H0', result = 'Homoscedasticity');
	var SrearmanOutput = { H: H, result: result, d: d, e: e, rankXj: Xji, rankAbse: ei, rs: rs, cv: cv, cvt: cvt };
	return SrearmanOutput;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Spearman.All = function (X, Y, estmeth, significance) {
	var X = euriklis.Mathematics.cloning(X).M, result = new Object();
	for (i = 0; i < X[0].length; i++)result['x' + String(i)] = euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Spearman(X, Y, estmeth, i, significance);
	return result;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Spearman.Some = function (X, Y, estmeth, coeffarr, significance) {
	var coeffarr = euriklis.Mathematics.cloning(coeffarr).M,
		X = euriklis.Mathematics.cloning(X).M;
	result = new Object();
	if (coeffarr.every(element => element >= 0) && Math.max.apply(null, coeffarr) < X[0].length) {
		for (i = 0; i < coeffarr.length; i++)result['x' + String(coeffarr[i])] = euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Spearman(X, Y, estmeth, coeffarr[i], significance);
	}
	else result.error = "A cofficient do not exist!";
	return result;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Park = function (X, Y, estmeth, index, significance) {
	var X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		e = euriklis.Econometrics.OLS(X, Y, estmeth).e.M;
	var ee = new Array();
	var ParkOutput = new Object();
	for (i = 0; i < e.length; i++) { ee[i] = e[i][0] * e[i][0]; }
	ee = [ee].toMatrix().transpose().M;
	var w = new Array();
	for (i = 0; i < ee.length; i++) {
		w[i] = new Array();
		w[i][0] = Math.log(e[i][0]);
	}
	var xj = new Array();
	for (i = 0; i < X.length; i++) {
		xj[i] = new Array();
		xj[i][0] = X[i][index];
	}
	//but the correct theoretically method is 2
	var c = euriklis.Econometrics.OLS(xj, ee, 4).Coefficients;
	//method 2:
	var result = euriklis.Econometrics.TestHypothesis.t(xj, ee, 4, [1], { set: [0] }, significance);
	var H = result['two-sided test'][0].H;
	var T_Pinax = result['two-sided test'][0].T_Pinax;
	var t_prob = result['two-sided test'][0].t_prob;
	var t_stat = result['two-sided test'][0].t_stat;
	ParkOutput.e = e;
	ParkOutput.ee = ee;
	ParkOutput.ParkCoefficients = c;
	ParkOutput.H = H;
	ParkOutput.T_Pinax = T_Pinax;
	ParkOutput.t_prob = t_prob;
	ParkOutput.t_stat = t_stat;
	return ParkOutput;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Park.All = function (X, Y, estmeth, significance) {
	var X = euriklis.Mathematics.cloning(X).M,
		result = new Object();
	for (i = 0; i < X[0].length; i++)result['x' + String(i)] = euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Park(X, Y, estmeth, i, significance);
	return result;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Park.Some = function (X, Y, estmeth, coeffarr, significance) {
	var X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		coeffarr = euriklis.Mathematics.cloning(coeffarr).M,
		result = new Object();
	if (coeffarr.every(element => element >= 0) && Math.max.apply(null, coeffarr) < X[0].length) {
		for (i = 0; i < coeffarr.length; i++)result['x' + String(coeffarr[i])] = euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Park(X, Y, estmeth, coeffarr[i], significance);
	}
	else result.error = "A cofficient do not exist!";
	return result;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Glejser = function (X, Y, estmeth, index, significance) {
	var X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		e = euriklis.Econometrics.OLS(X, Y, estmeth).e.M,
		abse = new Array(), xi = new Array(), sqrtxi = new Array();
	for (i = 0; i < e.length; i++) {
		abse[i] = new Array();
		sqrtxi[i] = new Array();
		xi[i] = new Array();
		abse[i][0] = Math.abs(e[i][0]);
		xi[i][0] = X[i][index];
		sqrtxi[i][0] = Math.sqrt(X[i][index]);
	}
	var firstGlejserRegression = euriklis.Econometrics.OLS(xi, abse, 0).Coefficients;
	var secondGlejserRegression = euriklis.Econometrics.OLS(sqrtxi, abse, 0).Coefficients;
	var thirdGlejserRegression = euriklis.Econometrics.OLS(xi, abse, 7).Coefficients;
	var forthGlejserRegression = euriklis.Econometrics.OLS(sqrtxi, abse, 7).Coefficients;
	var firstResult = euriklis.Econometrics.TestHypothesis.t(xi, abse, 0, [1], { set: [0] }, significance)['two-sided test'][0];
	var H_first = firstResult.H;
	var t_first = firstResult.t_stat;
	var t_prob_first = firstResult.t_prob;
	T_Pinax_first = firstResult.T_Pinax;
	var secondResult = euriklis.Econometrics.TestHypothesis.t(sqrtxi, abse, 0, [1], { set: [0] }, significance)['two-sided test'][0];
	var H_second = secondResult.H;
	var t_second = secondResult.t_stat;
	var t_prob_second = secondResult.t_prob;
	var T_Pinax_second = secondResult.T_Pinax;
	var thirdResult = euriklis.Econometrics.TestHypothesis.t(xi, abse, 7, [1], { set: [0] }, significance)['two-sided test'][0];
	var H_third = thirdResult.H;
	var t_third = thirdResult.t_stat;
	var t_prob_third = thirdResult.t_prob;
	var T_Pinax_third = thirdResult.T_Pinax;
	var forthResult = euriklis.Econometrics.TestHypothesis.t(sqrtxi, abse, 7, [1], { set: [0] }, significance)['two-sided test'][0];
	var H_forth = forthResult.H;
	var t_forth = forthResult.t_stat;
	var t_prob_forth = forthResult.t_prob;
	var T_Pinax_forth = forthResult.T_Pinax;
	testFirstRegression = { H: H_first, t_stat: t_first, t_prob: t_prob_first, T_Pinax: T_Pinax_first };
	testSecondRegression = { H: H_second, t_stat: t_second, t_prob: t_prob_second, T_Pinax: T_Pinax_second };
	testThirdtRegression = { H: H_third, t_stat: t_third, t_prob: t_prob_third, T_Pinax: T_Pinax_third };
	testForthRegression = { H: H_forth, t_stat: t_forth, t_prob: t_prob_forth, T_Pinax: T_Pinax_forth };
	GlejserOutput = new Object();
	GlejserOutput.H = (H_first == "Ha" && H_second == "Ha" && H_third == "Ha" && H_forth == "Ha") ? "Ha" : "H0";
	GlejserOutput.result = (GlejserOutput.H == "H0") ? "Homoscedasticity" : "Heteroscedasticity";
	GlejserOutput.abse = abse;
	GlejserOutput.firstGlejserRegression = firstGlejserRegression;
	GlejserOutput.secondGlejserRegression = secondGlejserRegression;
	GlejserOutput.thirdGlejserRegression = thirdGlejserRegression;
	GlejserOutput.forthGlejserRegression = forthGlejserRegression;
	GlejserOutput.testFirstRegression = testFirstRegression;
	GlejserOutput.testSecondRegression = testSecondRegression;
	GlejserOutput.testThirdRegression = testThirdtRegression;
	GlejserOutput.testForthRegression = testForthRegression;
	return GlejserOutput;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Glejser.All = function (X, Y, estmeth, significance) {
	var X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		result = new Object();
	for (i = 0; i < X[0].length; i++) { result['x' + String(i)] = euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Glejser(X, Y, estmeth, i, significance); }
	return result;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Glejser.Some = function (X, Y, estmeth, coeffarr, significance) {
	var X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		coeffarr = euriklis.Mathematics.cloning(coeffarr).M,
		result = new Object();
	if (coeffarr.every(element => element >= 0) && Math.max.apply(null, coeffarr) < X[0].length) {
		for (i = 0; i < coeffarr.length; i++)result['x' + String(coeffarr[i])] = euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Glejser(X, Y, estmeth, coeffarr[i], significance);
	}
	else result.error = "A cofficient do not exist!";
	return result;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Goldfeld_Qandt = function (X, Y, estmeth, index, c, significance) {
	var X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		n = X.length, k = X[0].length, GQOutput = new Object();
	if ((n - c) % 2 !== 0) { GQOutput.error = 'inappropriate c'; }
	else {
		if ((n - c) / 2 < k + 1) {
			GQOutput.error = 'too large c or too small n';
		}
		else {
			//creating of the matrices for estimation Y1-->X1,Y2-->X2:
			var xj = new Array();
			for (i = 0; i < X.length; i++) { xj[i] = X[i][index]; }
			var sortedxj = xj.toMatrix().mergeSort().coefficientsAssigment;
			var xjindexes = new Array();
			for (i = 0; i < sortedxj.length; i++) {
				for (j = 0; j < sortedxj[i].length; j++)xjindexes.push(sortedxj[i][j]);
			}
			var y1 = new Array(), y2 = new Array(), x1 = new Array(), x2 = new Array();
			for (i = 0; i < (n - c) / 2; i++) {
				y1[i] = new Array(); y2[i] = new Array(); x1[i] = new Array(); x2[i] = new Array();
				y1[i][0] = Y[xjindexes[i]][0];
				for (j = 0; j < k; j++) {
					x1[i][j] = X[xjindexes[i]][j];
				}
			}
			for (i = 0; i < (n - c) / 2; i++) {
				y2[i][0] = Y[xjindexes[0.5 * (n + c) + i]][0];
				for (j = 0; j < k; j++) {
					x2[i][j] = X[xjindexes[0.5 * (n + c) + i]][j];
				}
			}
			var regression1 = euriklis.Econometrics.OLS(x1, y1, estmeth);
			var regression2 = euriklis.Econometrics.OLS(x2, y2, estmeth);
			var ESS1 = regression1.ESS;
			var ESS2 = regression2.ESS;
			var GQ = ESS2 / ESS1;
			var GQ_prob = euriklis.Distribution.F_Fisher_p(GQ, 0.5 * (n - c) - k - 1, 0.5 * (n - c) - k - 1);
			var F_Pinax = euriklis.Distribution.F_Fisher(0.5 * (n - c) - k - 1, 0.5 * (n - c) - k - 1, significance, 0.000001, 'X');
			var H = (GQ <= F_Pinax) ? 'H0' : 'Ha';
			var result = (H === 'H0') ? 'Homoscedasticity' : 'Heteroscedasticity';
			GQOutput.H = H;
			GQOutput.result = result;
			GQOutput.sortedxj = xjindexes;
			GQOutput.regression1 = regression1;
			GQOutput.regression2 = regression2;
			GQOutput.x1 = x1;
			GQOutput.x2 = x2;
			GQOutput.y1 = y1;
			GQOutput.y2 = y2;
			GQOutput.regression1 = regression1;
			GQOutput.regression2 = regression2;
			GQOutput.ESS1 = ESS1;
			GQOutput.ESS2 = ESS2;
			GQOutput.F_Pinax = F_Pinax;
			GQOutput.GQ = GQ;
			GQOutput.GQ_prob = GQ_prob;
		}
	}
	return GQOutput;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Goldfeld_Qandt.All = function (X, Y, estmeth, c, significance) {
	var X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		result = new Object();
	for (a = 0; a < X[0].length; a++) { result['x' + a] = euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Goldfeld_Qandt(X, Y, estmeth, a, c, significance); }
	return result;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Goldfeld_Qandt.Some = function (X, Y, estmeth, coeffarr, c, significance) {
	var X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		coeffarr = euriklis.Mathematics.cloning(coeffarr).M,
		result = new Object();
	if (coeffarr.every(element => element >= 0) && Math.max.apply(null, coeffarr) < X[0].length) {
		for (a = 0; a < coeffarr.length; a++) { result['x' + String(coeffarr[a])] = euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Goldfeld_Qandt(X, Y, estmeth, coeffarr[a], c, significance); }
	}
	else result.error = "A cofficient do not exist!";
	return result;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Breusch_Pagan_Godfrey = function (X, Y, estmeth1, Z, estmeth2, significance, T) {
	var BPGOutput = new Object(),
		X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		Z = euriklis.Mathematics.cloning(Z).M,
		n = X.length,
		reg = euriklis.Econometrics.OLS(X, Y, estmeth1, T),
		T = typeof T === 'undefined' ? reg.T : euriklis.Mathematics.cloning(T).M,
		e = reg.e.M,
		s2 = reg.ESS / n,
		m = Z[0].length,
		es2 = new Array();
	for (i = 0; i < e.length; i++) {
		es2[i] = new Array();
		es2[i][0] = e[i][0] * e[i][0] / s2;
	}
	var BPG = 0.5 * euriklis.Econometrics.OLS(Z, es2, estmeth2, T).ESS;
	var chi_sq_prob = euriklis.Distribution.Chi_square_p(BPG, m);
	var chi_sq_pinax = euriklis.Distribution.Chi_square_chi(m, significance, 0.000001, 'X');
	var H = (BPG <= chi_sq_pinax) ? 'H0' : 'Ha';
	var result = (H === 'H0') ? 'Homoscedasticity' : 'Heteroscedasticity';
	BPGOutput.H = H;
	BPGOutput.result = result;
	BPGOutput.e = e;
	BPGOutput.relativeResidualSquares = es2;
	BPGOutput.Var = s2;
	BPGOutput.BPG = BPG;
	BPGOutput.chi_sq_pinax = chi_sq_pinax;
	BPGOutput.BPG_prob = chi_sq_prob;
	return BPGOutput;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.White = function (X, Y, estmeth, significance) {
	var WhiteOutput = new Object(),
		X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		n = X.length,
		reg = euriklis.Econometrics.OLS(X, Y, estmeth),
		b = reg.Coefficients,
		Yest = reg.x.times(b).M,
		e = reg.e.M,
		e2 = new Array();
	for (var i = 0; i < e.length; i++) {
		e2[i] = new Array();
		e2[i][0] = e[i][0] * e[i][0];
	}
	//white matrix of x:
	var wx = new Array();
	for (var i = 0; i < Y.length; i++) {
		wx[i] = new Array();
		wx[i][0] = Yest[i][0];
		wx[i][1] = Yest[i][0] * Yest[i][0];
	}
	//white estimation test:
	var whest1 = euriklis.Econometrics.OLS(wx, e2, 0);
	var R1 = whest1.R;
	var W1 = n * R1;
	var newx = euriklis.Mathematics.cloning(X).M;
	for (var i = 0; i < X.length; i++) {
		for (var j = 0; j < X[0].length; j++) {
			newx[i].push(X[i][j] * X[i][j]);
		}
	}
	for (var i = 0; i < X.length; i++) {
		for (var j = 0; j < X[0].length - 1; j++) {
			for (var p = j + 1; p < X[0].length; p++) {
				newx[i].push(X[i][j] * X[i][p]);
			}
		}
	}
	var whest2 = euriklis.Econometrics.OLS(newx, e2, 0);
	var R2 = whest2.R;
	var W2 = n * R2;
	var chi_sq_pinax1 = euriklis.Distribution.Chi_square_chi(wx[0].length, significance, 0.000001, 'X');
	var chi_sq_pinax2 = euriklis.Distribution.Chi_square_chi(newx[0].length, significance, 0.000001, 'X');
	var W1_prob = euriklis.Distribution.Chi_square_p(wx[0].length, W1);
	var W2_prob = euriklis.Distribution.Chi_square_p(newx[0].length, W2);
	var H1 = (W1 <= chi_sq_pinax1) ? 'H0' : 'Ha';
	var H2 = (W2 <= chi_sq_pinax2) ? 'H0' : 'Ha';
	var result_1 = (H1 === 'H0') ? 'Homoscedasticity' : 'Heteroscedasticity';
	var result_2 = (H2 === 'H0') ? 'Homoscedasticity' : 'Heteroscedasticity';
	WhiteOutput.newx = newx;
	WhiteOutput.e_sq_estimation1 = whest1;
	WhiteOutput.e_sq_estimation2 = whest2;
	WhiteOutput.e_sq = e2;
	WhiteOutput.W1 = W1;
	WhiteOutput.W2 = W2;
	WhiteOutput.R_e_sq_estimation1 = R1;
	WhiteOutput.R_e_sq_estimation2 = R2;
	WhiteOutput.chi_sq_pinax_1 = chi_sq_pinax1;
	WhiteOutput.chi_sq_pinax_2 = chi_sq_pinax2;
	WhiteOutput.W1_prob = W1_prob;
	WhiteOutput.W2_prob = W2_prob;
	WhiteOutput.H1 = H1;
	WhiteOutput.H2 = H2;
	WhiteOutput.result_1 = result_1;
	WhiteOutput.result_2 = result_2;
	return WhiteOutput;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.Koenker_Basett = function (X, Y, estmeth, significance) {
	var KBOutput = new Object(),
		X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		n = X.length,
		reg = euriklis.Econometrics.OLS(X, Y, estmeth),
		Yest = reg.x.times(reg.Coefficients).M,
		e = reg.e.M,
		e2 = new Array,
		y2 = new Array();
	for (var i = 0; i < e.length; i++) {
		e2[i] = new Array();
		y2[i] = new Array();
		e2[i][0] = e[i][0] * e[i][0];
		y2[i][0] = Yest[i][0] * Yest[i][0];
	}
	var Koenker_Basett_regression = euriklis.Econometrics.OLS(y2, e2, 0);
	var R_KB = Koenker_Basett_regression.R;
	var KB = n * R_KB;
	var chi_sq_pinax = euriklis.Distribution.Chi_square_chi(1, significance, 0.000001, 'X');
	var KB_prob = euriklis.Distribution.Chi_square_p(1, KB);
	var H = (KB <= chi_sq_pinax) ? 'H0' : 'Ha';
	var result = (H === 'H0') ? 'Homoscedasticity' : 'Heteroscedasticity';
	KBOutput.H = H;
	KBOutput.result = result;
	KBOutput.KB = KB;
	KBOutput.R_KB = R_KB;
	KBOutput.KB_prob = KB_prob;
	KBOutput.chi_sq_pinax = chi_sq_pinax;
	KBOutput['y-estimated squares'] = y2;
	KBOutput['e-squares'] = e2;
	KBOutput['Koenker-Basett regression'] = Koenker_Basett_regression;
	return KBOutput;
}
euriklis.Econometrics.TestHypothesis.Heteroscedasticity.LR = function (X, Y, estmeth, objIndex, significance, T) {
	/*
	the variable objIndex is an object which contains 
	description of the variable wich is suspect for 
	correlation with the residuals.The general form of
	the obgect is the folloed:
	{
	matrix:x or y
	index:k if matrix is x and ONLY 0 |ZERO| for y, where k is an Integer number
	groups:qPointArr, where qPointArr is an array who contains the break-point matrix coefficients.
	} 
	*/
	var LROutput = new Object(), VAR = euriklis.Econometrics.VAR,
		X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		yest = euriklis.Econometrics.OLS(X, Y, estmeth).x.times(euriklis.Econometrics.OLS(X, Y, estmeth).Coefficients).M,
		e = euriklis.Econometrics.OLS(X, Y, estmeth).e.M;
	var sortingVariable = null;
	if (objIndex.matrix === 'x' && X[0].length === 1) {
		var XT = X.toMatrix().transpose().M;
		sortingVariable = XT[0].toMatrix().mergeSort().coefficientsAssigment;
	}
	else {
		if (objIndex.matrix === 'x' && X[0].length != 0) {
			var xj = new Array();
			for (var i = 0; i < X.length; i++) {
				xj[i] = X[i][objIndex.index];
			}
			sortingVariable = xj.toMatrix().mergeSort().coefficientsAssigment;
		}
		else {
			if (objIndex.matrix = 'y') {
				var yj = yest.toMatrix().transpose().M;
				console.log(yj);
				sortingVariable = yj[0].toMatrix().mergeSort().coefficientsAssigment;
			}
		}
	}
	var indexesBasedOnSortVariable = new Array();
	for (var i = 0; i < sortingVariable.length; i++) {
		for (var j = 0; j < sortingVariable[i].length; j++) {
			indexesBasedOnSortVariable.push(sortingVariable[i][j]);
		}
	}
	var groupY = new Array(), groupX = new Array();
	for (var i = 0; i < objIndex.groups.length + 1; i++) {
		groupY[i] = new Array();
		groupX[i] = new Array();
	}
	for (var i = 0; i < groupY.length; i++) {
		if (i == 0) {
			for (var j = 0; j <= objIndex.groups[i]; j++) {
				groupY[i][j] = new Array();
				groupX[i][j] = new Array();
				groupY[i][j][0] = e[indexesBasedOnSortVariable[j]][0];
				for (var p = 0; p < X[0].length; p++) {
					groupX[i][j][p] = X[indexesBasedOnSortVariable[j]][p];
				}
			}
		}
		if (i > 0 && i < objIndex.groups.length) {
			for (var j = 0; j < objIndex.groups[i] - objIndex.groups[i - 1]; j++) {
				groupY[i][j] = new Array();
				groupX[i][j] = new Array();
				groupY[i][j][0] = e[indexesBasedOnSortVariable[j + objIndex.groups[i - 1] + 1]][0];
				for (var p = 0; p < X[0].length; p++) {
					groupX[i][j][p] = X[indexesBasedOnSortVariable[j + objIndex.groups[i - 1] + 1]][p];
				}
			}
		}
		if (i > 0 && i == objIndex.groups.length) {
			for (var j = 0; j < Y.length - objIndex.groups[i - 1] - 1; j++) {
				groupY[i][j] = new Array();
				groupX[i][j] = new Array();
				groupY[i][j][0] = e[indexesBasedOnSortVariable[objIndex.groups[i - 1] + j + 1]][0];
				for (var p = 0; p < X[0].length; p++) {
					groupX[i][j][p] = X[indexesBasedOnSortVariable[objIndex.groups[i - 1] + j + 1]][p];
				}
			}
		}
	}
	/* console.log(groupY); */
	var groupe = new Array(), dispersionMatrix = new Array(), LR = 0;
	for (var i = 0; i < groupY.length; i++) {
		groupe[i] = groupY[i].toMatrix().transpose().M[0];
		dispersionMatrix[i] = Math.sqrt(VAR(groupe[i]));

	}
	for (var i = 0; i < groupe.length; i++) {
		LR += groupe[i].length * Math.log(dispersionMatrix[i]);
	}
	LR -= e.length * Math.log(Math.sqrt(VAR(e.toMatrix().transpose().M[0])));
	LR *= -2;
	var dispArr;
	dispArr = euriklis.Mathematics.cloning(dispersionMatrix).M;
	dispArr.push(Math.sqrt(VAR(e.toMatrix().transpose().M[0])));
	var chi_sq_pinax = euriklis.Distribution.Chi_square_chi(groupe.length - 1, significance, 0.000001, 'X');
	var LR_prob = euriklis.Distribution.Chi_square_p(groupe.length, LR);
	LROutput.sort = indexesBasedOnSortVariable;
	LROutput.H = (LR < chi_sq_pinax) ? 'H0' : 'Ha';
	LROutput.result = (LROutput.H === 'H0') ? 'Homoscedasticity' : 'Heteroscedasticity';
	LROutput.chi_sq_pinax = chi_sq_pinax;
	LROutput.LR_prob = LR_prob;
	LROutput.dispersionArr = dispArr;
	return LROutput;
}
euriklis.Econometrics.TestHypothesis.Autocorrelation = new Object();
euriklis.Econometrics.TestHypothesis.Autocorrelation.vonNeumann = function (X, Y, estmeth, significance) {
	var vno = new Object(),
		X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		regvno = euriklis.Econometrics.OLS(X, Y, estmeth),
		e = regvno.e.M,
		n = Y.length,
		s = regvno.ESS / n,
		vn;//vno --> von Neumann output...
	var dife = 0;// dife = 1/(n-1)Σ[e(t) - e(t-1)]^2
	for (var i = 1; i < e.length; i++) {
		dife += (e[i][0] - e[i - 1][0]) * (e[i][0] - e[i - 1][0]);
	}
	dife /= n - 1;
	vn = dife / s;
	var sz = Math.sqrt(4 * n * n * (n - 2) / ((n + 1) * (n - 1) * (n - 1) * (n - 1)));
	vno.vn = vn;
	vno.s = Math.sqrt(s);
	vno.σ_Κάτος = Math.sqrt(s * n / (n - 2));
	vno.vn_Κάτος = dife / (s * n / (n - 2));
	vno.δ = dife;
	vno.sz = sz;
	vno.μ = 2 * n / (n - 1);
	vno.Za = euriklis.Distribution.Typical_Normal_z(significance / 2);
	vno.Zvn = (vno.vn - (2 * n / (n - 1))) / sz;
	vno.Zvn_Κάτος = (vno.vn_Κάτος - (2 * n / (n - 1))) / sz;
	vno.H = (Math.abs((vno.vn - (2 * n / (n - 1))) / sz) < vno.Za) ? 'H0' : 'Ha';
	vno.result = (vno.H == 'H0') ? 'no autocorrelation' : 'autocorrelation';
	return vno;
}
euriklis.Econometrics.TestHypothesis.Autocorrelation.DW = function (X, Y, e_t) {
	return euriklis.Econometrics.TestHypothesis.DW(X, Y, e_t);
}
euriklis.Econometrics.TestHypothesis.Autocorrelation.h_Durbin = function (X, Y, e_t, significance) {
	var hd = new Object(),
		X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		n = Y.length,
		newx = euriklis.Mathematics.cloning(X).M;;
	newx.shift();
	for (var i = 0; i < n - 1; i++) {
		newx[i].push(Y[i]);
	}
	var newy = euriklis.Mathematics.cloning(Y).M;
	newy.shift();
	var ols_h = euriklis.Econometrics.OLS(newx, newy, e_t), r, upr = 0, e = ols_h.e.M;
	for (var i = 1; i < e.length; i++) {
		upr += e[i][0] * e[i - 1][0];
	}
	r = upr / ols_h.ESS;
	varb2 = ols_h.Var_b.M[ols_h.x.M[0].length - 1][ols_h.x.M[0].length - 1];
	var h = (n * varb2 < 1) ? (r * Math.sqrt(n / (1 - n * varb2))) : false;
	var Za = euriklis.Distribution.Typical_Normal_z(significance / 2);
	hd['h_Durbin Regression'] = ols_h;
	hd.re = r;
	hd.var_b = varb2;
	hd.h = h;
	hd.H = (h === false) ? (false) : ((Math.abs(h) < Za) ? 'H0' : 'Ha');
	hd.result = hd.H !== false ? (hd.H == 'H0') ? 'no autocorrelation' : 'autocorrelation' : 'it is no possible to give conclusions';
	return hd;
}
euriklis.Econometrics.TestHypothesis.Autocorrelation.alternativeDurbin = function (X, Y, ae_t, significance) {
	var ad = new Object(),
		X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		n = Y.length,
		newx = euriklis.Mathematics.cloning(X).M;
	newx.shift();
	for (var i = 0; i < n - 1; i++) {
		newx[i].push(Y[i][0]);
	}
	var newy = euriklis.Mathematics.cloning(Y).M;
	newy.shift();
	var ols_h = euriklis.Econometrics.OLS(newx, newy, 0),
		e_h = ols_h.e.M;
	var newx_a = euriklis.Mathematics.cloning(newx).M;
	newx_a.shift();
	for (i = 0; i < n - 2; i++) {
		newx_a[i].push(e_h[i][0]);
	}
	e_h.shift();
	var ols_a = euriklis.Econometrics.OLS(newx_a, e_h, 0);
	var k = ols_a.x.M[0].length;
	var t_pinax = euriklis.Econometrics.TestHypothesis.t(newx_a, e_h, 0, [k - 1], { set: [0] }, significance)['two-sided test'][0].T_Pinax;
	var t_stat = euriklis.Econometrics.TestHypothesis.t(newx_a, e_h, 0, [k - 1], { set: [0] }, significance)['two-sided test'][0].t_stat;
	ad.alternativeDurbinRegression = ols_a;
	ad.hDurbinRegression = ols_h;
	ad.H = euriklis.Econometrics.TestHypothesis.t(newx_a, e_h, 0, [k - 1], { set: [0] }, significance)['two-sided test'][0].H;
	ad.result = (ad.H == 'H0') ? 'no autocorrelation' : 'autocorrelation';
	ad.t_stat_e = t_stat;
	ad.T_Pinax_e = t_pinax;
	return ad;
}
euriklis.Econometrics.TestHypothesis.Autocorrelation.t = function (X, Y, te_t, significance) {
	var t = new Object(), reg = euriklis.Econometrics.OLS(X, Y, te_t), e = reg.e.M, et, etm1;/*etm1 --> e(t-1)*/
	etm1 = euriklis.Mathematics.cloning(e).M;
	et = euriklis.Mathematics.cloning(e).M;
	et.shift();
	etm1.pop();
	/*console.log(et);
	/console.log(etm1);*/
	var tRegressionOfe = euriklis.Econometrics.OLS(etm1, et, 1);
	var tht = euriklis.Econometrics.TestHypothesis.t(etm1, et, 1, [0], { set: [0] }, significance)['two-sided test'][0];
	t.errorCoefficient = tRegressionOfe.Coefficients;
	t.H = tht.H;
	t.result = tht.H === 'H0' ? 'no autocorrelation' : 'autocorrelation';
	t.T_Pinax = tht.T_Pinax;
	t.t_stat = tht.t_stat;
	t.t_prob = tht.t_prob;
	return t;
}
euriklis.Econometrics.TestHypothesis.Autocorrelation.Geary = function (X, Y, ge_t, significance) {
	var geary = new Object(),
		e = euriklis.Econometrics.OLS(X, Y, ge_t).e.M, n1 = 0, n2 = 0, k = 0;
	/*console.log(e);*/
	for (var i = 0; i < e.length; i++) {
		(i == 0) ? ((e[i][0] >= 0) ? (n1 += 1, k += 1) : (n2 += 1, k += 1)) : ((e[i][0] >= 0) ? ((e[i - 1][0] < 0) ? (k += 1, n1 += 1) : n1 += 1) : ((e[i - 1][0] > 0) ? (k += 1, n2 += 1) : n2 += 1));
	}
	/*Expected k:*/
	var EK = 1 + 2 * n1 * n2 / (n1 + n2);
	/*Expected dispersion of k:*/
	var EDK = 2 * n1 * n2 * (2 * n1 * n2 - n1 - n2) / ((n1 + n2) * (n1 + n2) * (n1 + n2 - 1));
	var Geary = (k - EK) / Math.sqrt(EDK);
	var Za = euriklis.Distribution.Typical_Normal_z(significance / 2);
	var G_prob = euriklis.Distribution.Typical_Normal_p(Geary);
	geary.H = (Math.abs(Geary) < Za) ? 'H0' : 'Ha'; geary.expectedSTD = Math.sqrt(EDK);
	geary.result = (geary.H === 'H0') ? 'no autocorrelation' : 'Autocorrelation';
	geary.signGroups = k;
	geary.positiveSign = n1;
	geary.negativeSign = n2;
	geary.Za = Za;
	geary.expectedGroups = EK;
	geary.expectedDispersion = EDK;
	geary.Geary = Geary;
	geary.Geary_prob = G_prob;
	return geary;
}
euriklis.Econometrics.TestHypothesis.Autocorrelation.independentChiSq = function (X, Y, ine_t, significance) {
	var icq = new Object(),
		X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		n = Y.length,
		a = 0, b = 0, c = 0, d = 0,
		e = euriklis.Econometrics.OLS(X, Y, ine_t).e.M,
		chi_sq_pinax = euriklis.Distribution.Chi_square_chi(1, significance, 0.000001, 'X');
	for (var i = 1; i < e.length; i++) {
		var A = e[i][0] > 0 && e[i - 1][0] > 0;
		var B = e[i][0] > 0 && e[i - 1][0] < 0;
		var C = e[i][0] < 0 && e[i - 1][0] > 0;
		A ? a += 1 : B ? b += 1 : C ? c += 1 : d += 1;
	}
	var chi_sq_stat = (n - 1) * (a * d - b * c) * (a * d - b * c) / ((a + c) * (b + d) * (a + b) * (c + d));
	icq.H = (chi_sq_stat < chi_sq_pinax) ? 'H0' : 'Ha';
	icq.result = (icq.H == 'H0') ? 'no autocorrelation' : 'Autocorrelation';
	icq.chi_sq_pinax = chi_sq_pinax;
	icq.chi_sq_stat = chi_sq_stat;
	icq.chi_sq_prob = euriklis.Distribution.Chi_square_p(1, chi_sq_stat);
	icq['Plus-Plus'] = a;
	icq['Plus-Minus'] = b;
	icq['Minus-Plus'] = c;
	icq['Minus-Minus'] = d;
	return icq;
}
euriklis.Econometrics.TestHypothesis.Autocorrelation.Berenblut_Webb = function (X, Y, bwe_t) {
	var bw = new Object(),
		X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		reg = euriklis.Econometrics.OLS(X, Y, bwe_t),
		ESS1 = reg.ESS, n = Y.length,
		k = reg.x.M[0].length, dwl = euriklis.Distribution.Durbin_Watson(n, k, 0), dwu = euriklis.Distribution.Durbin_Watson(n, k, 1);
	var Arrdx = euriklis.Mathematics.cloning(X).M;
	var Arrdy = euriklis.Mathematics.cloning(Y).M;
	Arrdx.shift();
	Arrdy.shift();
	for (var i = 0; i < n - 1; i++) {
		Arrdy[i][0] -= Y[i][0];
		for (var j = 0; j < X[i].length; j++) { Arrdx[i][j] -= X[i][j]; }
	}
	var dbwe_t = bwe_t == 0 ? 1 : bwe_t == 1 ? 1 : bwe_t == 2 ? 3 : bwe_t == 3 ? 3 : bwe_t == 4 ? 5 : bwe_t == 5 ? 5 : bwe_t == 6 ? 8 : bwe_t == 8 ? 8 : bwe_t == 7 ? 9 : 9;
	var reg2 = euriklis.Econometrics.OLS(Arrdx, Arrdy, dbwe_t);
	var ESS2 = reg2.ESS;
	var g = ESS2 / ESS1;
	bw.g = g;
	bw.DWl = dwl;
	bw.DWu = dwu;
	bw.H = (g < dwl) ? 'H0' : (g > dwu) ? 'Ha' : 'H';
	bw.result = (bw.H === 'H0') ? 'Perfect positive autocorrelation' : (bw.H === 'Ha') ? 'Not perfect autocorrelation' : 'no result';
	bw.ESS_regression = ESS1;
	bw.ESS_firstDifferencesRegression = ESS2;
	return bw;
}
euriklis.Econometrics.TestHypothesis.Autocorrelation.Breusch_Godfrey = function (a, b, bge_t, p, significance) {
	var bg = new Object(),
		a = euriklis.Mathematics.cloning(a).M,
		b = euriklis.Mathematics.cloning(b).M,
		e = euriklis.Econometrics.OLS(a, b, bge_t).e.M,
		newe = euriklis.Mathematics.cloning(e).M,
		newx = euriklis.Mathematics.cloning(a).M,
		n = e.length;
	for (var i = 0; i < p; i++) {
		newe.shift(); newx.shift();
	}
	for (var i = 0; i < newe.length; i++) {
		for (var j = p - 1; j >= 0; j--) { newx[i].push(e[j + i][0]); }
	}
	var R_BG = euriklis.Econometrics.OLS(newx, newe, bge_t).R;
	var BG = (n - p) * R_BG;
	var chi_sq_pinax = euriklis.Distribution.Chi_square_chi(p, significance, 0.000001, 'X');
	var BG_prob = euriklis.Distribution.Chi_square_p(p, BG);
	bg.H = (BG < chi_sq_pinax) ? 'H0' : 'Ha';
	bg.result = (bg.H === 'H0') ? 'No autocorrelation' : 'Autocorrelation';
	bg.chi_sq_pinax = chi_sq_pinax;
	bg.BG_prob = BG_prob;
	bg.R_BG = R_BG;
	bg.BG = BG;
	return bg;
}
euriklis.Econometrics.TestHypothesis.Autocorrelation.Wald = function (X, Y, we_t, p, significance) {
	var w = new Object(),
		X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		ESS_R = euriklis.Econometrics.OLS(X, Y, we_t).ESS,
		k = euriklis.Econometrics.OLS(X, Y, we_t).x.M[0].length,
		n = Y.length,
		e = euriklis.Econometrics.OLS(X, Y, we_t).e.M,
		newe = euriklis.Mathematics.cloning(e).M,
		newx = euriklis.Mathematics.cloning(X).M;
	for (var i = 0; i < p; i++) { newe.shift(); newx.shift(); }
	for (var i = 0; i < newe.length; i++) {
		for (var j = p - 1; j >= 0; j--) { newx[i].push(e[j + i][0]); }
	}
	var ESS_U = euriklis.Econometrics.OLS(newx, newe, we_t).ESS;
	W = ((ESS_R - ESS_U) * (n - k - p)) / (ESS_U * p);
	pW = p * W;
	var chi_sq_pinax = euriklis.Distribution.Chi_square_chi(p, significance, 0.000001, 'X');
	var pW_prob = euriklis.Distribution.Chi_square_p(p, pW);
	var F_Pinax = euriklis.Distribution.F_Fisher(p, n - k - p, significance, 0.000001, 'X');
	var W_prob = euriklis.Distribution.F_Fisher_p(W, p, n - k - p);
	w.W = W;
	w.pW = pW;
	w.W_prob = W_prob;
	w.F_Pinax = F_Pinax;
	w.pW_prob = pW_prob;
	w.chi_sq_pinax = chi_sq_pinax;
	w.H = new Object();
	w.H.F = (W <= F_Pinax) ? 'H0' : 'Ha';
	w.H.chi_sq = (pW < chi_sq_pinax) ? 'H0' : 'Ha';
	w.result = new Object();
	w.result.F = (w.H.F === 'H0') ? 'No autocorrelation' : 'Autocorrelation';
	w.result.chi_sq = (w.H.chi_sq === 'H0') ? 'No autocorrelation' : 'Autocorrelation';
	w.ESS_U = ESS_U;
	w.ESS_R = ESS_R;
	return w;
}
euriklis.Econometrics.TestHypothesis.Autocorrelation.Box_Pierce = function (X, Y, bxpe_t, p, significance) {
	var bxp = new Object(),
		X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		e = euriklis.Econometrics.OLS(X, Y, bxpe_t).e.M,
		ESS = euriklis.Econometrics.OLS(X, Y, bxpe_t).ESS,
		n = e.length;
	var r_s = function (e, s) {
		var r_s = 0;
		for (var i = s; i < n; i++) { r_s += e[i][0] * e[i - s][0]; }
		r_s /= ESS;
		return r_s;
	}
	var LB_Q = 0, correlationLagCoeffitients = new Array();
	for (var i = 1; i <= p; i++) {
		LB_Q += r_s(e, i) * r_s(e, i) / (n - i);
		correlationLagCoeffitients.push(r_s(e, i));
	}
	LB_Q *= n * (n + 2);
	var chi_sq_pinax = euriklis.Distribution.Chi_square_chi(p, significance, 0.000001, 'X');
	var LB_Q_prob = euriklis.Distribution.Chi_square_p(p, LB_Q);
	bxp.ESS = ESS;
	bxp.correlationLagCoeffitients = correlationLagCoeffitients;
	bxp.LB_Q = LB_Q;
	bxp.chi_sq_pinax = chi_sq_pinax;
	bxp.LB_Q_prob = LB_Q_prob;
	bxp.H = (LB_Q < chi_sq_pinax) ? 'H0' : 'Ha';
	bxp.result = (bxp.H === 'H0') ? 'No autocorrelation' : 'Autocorrelation';
	return bxp;
}
euriklis.Econometrics.TestHypothesis.Autocorrelation.Wallis = function (X, Y, wle_t) {
	var wl = new Object(), e = euriklis.Econometrics.OLS(X, Y, wle_t).e.M, n = e.length, ESS = euriklis.Econometrics.OLS(X, Y, wle_t).ESS, d4 = 0;
	for (var i = 4; i < n; i++) {
		d4 += (e[i][0] - e[i - 4][0]) * (e[i][0] - e[i - 4][0]);
	}
	d4 /= ESS;
	wl.d4 = d4;
	return wl;
}
euriklis.Econometrics.TestHypothesis.Normality = new Object();
euriklis.Econometrics.TestHypothesis.Normality.Jarque_Bera = function (X, Y, jbe_t, significance) {
	var jb = new Object(),
		e = euriklis.Econometrics.OLS(X, Y, jbe_t).e.transpose().M[0],
		n = e.length,
		k = euriklis.Econometrics.OLS(X, Y, jbe_t).x.M[0].length,
		s = Math.sqrt(euriklis.Econometrics.VAR(e)),
		sdt = Math.sqrt(euriklis.Econometrics.OLS(X, Y, jbe_t).ESS / (n));
	em = 0;
	for (var i = 0; i < n; i++) { em += e[i]; }
	em /= n;
	//asymetry coefficient:
	var S_non_asymptotic = 0;
	for (var i = 0; i < n; i++) {
		S_non_asymptotic += (((e[i] - em) / s) * ((e[i] - em) / s) * ((e[i] - em) / s));
	}
	S_non_asymptotic /= n;
	var S_asymptotic = 0;
	for (var i = 0; i < n; i++) {
		S_asymptotic += (((e[i] - em) / sdt) * ((e[i] - em) / sdt) * ((e[i] - em) / sdt));
	}
	S_asymptotic /= n;
	//Kurtosis coefficient:
	var K_non_asymptotic = 0;
	for (var i = 0; i < n; i++) {
		K_non_asymptotic += (((e[i] - em) / s) * ((e[i] - em) / s) * ((e[i] - em) / s) * ((e[i] - em) / s));
	}
	K_non_asymptotic /= n;
	var K_asymptotic = 0;
	for (var i = 0; i < n; i++) {
		K_asymptotic += (((e[i] - em) / sdt) * ((e[i] - em) / sdt) * ((e[i] - em) / sdt) * ((e[i] - em) / sdt));
	}
	K_asymptotic /= n;
	var JB_asymptotic = (n) * (S_asymptotic * S_asymptotic + 0.25 * (K_asymptotic - 3) * (K_asymptotic - 3)) / 6;
	var JB_non_asymptotic = (n - k) * (S_non_asymptotic * S_non_asymptotic + 0.25 * (K_non_asymptotic - 3) * (K_non_asymptotic - 3)) / 6;
	var chi_sq_pinax = euriklis.Distribution.Chi_square_chi(2, significance, 0.000001, 'X');
	var JB_asymptotic_prob = euriklis.Distribution.Chi_square_p(2, JB_asymptotic);
	var JB_non_asymptotic_prob = euriklis.Distribution.Chi_square_p(2, JB_non_asymptotic);
	jb.e = e;
	jb.asyVar_e = sdt;
	jb.var_e = s;
	jb.ESS = euriklis.Econometrics.OLS(X, Y, jbe_t).ESS;
	jb.asymptotic_JB = JB_asymptotic;
	jb.non_asymptotic_JB = JB_non_asymptotic;
	jb.asySkewness = S_asymptotic;
	jb.Skewness = S_non_asymptotic;
	jb.asyKurtosis = K_asymptotic;
	jb.Kurtosis = K_non_asymptotic;
	jb.chi_sq_pinax = chi_sq_pinax;
	jb.asymptotic_JB_prob = JB_asymptotic_prob;
	jb.non_asymptotic_JB_prob = JB_non_asymptotic_prob;
	jb.H = new Object();
	jb.H.asymptotic = (JB_asymptotic < chi_sq_pinax) ? 'H0' : 'Ha';
	jb.H.non_asymptotic = (JB_non_asymptotic < chi_sq_pinax) ? 'H0' : 'Ha';
	return jb;
}
euriklis.Econometrics.TestHypothesis.Multicolinearity = new Object();
euriklis.Econometrics.TestHypothesis.Multicolinearity.Frisch = function (X, Y, fre_t, sign_fr) {
	/*Hight R and small t*/
	var R = euriklis.Econometrics.OLS(X, Y, fre_t).R,
		R1 = euriklis.Econometrics.OLS(X, Y, fre_t).AjR,
		tlogos = euriklis.Econometrics.TestHypothesis.t(X, Y, fre_t, 'all', { fix: [0] }, sign_fr)['two-sided test'],
		variables = new Array(), tl = new Array(), i, result = new Object();
	if (R >= 0.8 && R1 >= 0.8) {
		for (i = 0; i < tlogos.length; i++) {
			if (tlogos[i].H === 'H0') {
				tl.push(tlogos[i]);
				variables.push(i);
			}
		}
		if (tl.length === 0) {
			result.H = 'Ha';
			result.result = 'all coefficients are significant';
			result.MulticolinearityCoeff = tl;
		}
		if (tl.length !== 0) {
			result.H = 'H0';
			result.result = 'Exists coefficients with small t';
			result.MulticolinearityCoeff = tl;
			result.variables = variables;
		}
	}
	else {
		result.H = 'Ha';
		result.result = 'The R is lawer than 0.80';
	}
	result.R = R;
	result.AjR = R1;
	return result;
}
euriklis.Econometrics.TestHypothesis.Multicolinearity.Hight_r = function (X, Y, hre_t, criticalValue) {
	/************************************************************
	* This test check for multicolinearity using the correlation*
	* coefficients of NON TRANSFORMED X MATRIX of the inputs    *
	************************************************************* 
	*/
	var X = euriklis.Mathematics.cloning(X).M,
		Y = euriklis.Mathematics.cloning(Y).M,
		reg = euriklis.Econometrics.OLS(X, Y, hre_t),
		R = reg.R,
		x = euriklis.Mathematics.cloning(X).M,
		i, k, j, res = {};
	res.multicolinearity = { harmful: [], remarkable: [] };
	for (i = 0; i < x.length; i++)x[i].unshift(parseFloat(Y[i][0]));
	var r = euriklis.Econometrics.correlationMatrix(x).M;
	for (var k = 0; k < x.length; k++) {
		for (j = k; j < x[0].length; j++) {
			if (k != j && (k !== 0) && k != j && j != 0) {
				if (R > 0.8 && R < r[k][j]) {
					res.multicolinearity.harmful.push({ r: r[k][j], coeff: [k, j] });
				}
				else {
					if (R > 0.8 && r[k][j] > criticalValue) {
						res.multicolinearity.remarkable.push({ r: r[k][j], coeff: [k, j] });
					}
				}
			}
		}
	}
	res.R = R;
	res.r = r;
	return res;
}
euriklis.Econometrics.TestHypothesis.Multicolinearity.Farrar_Glauber = function (X, Y, fge_t, crVal_fg) {
	var res = new Object(),
		Y = euriklis.Mathematics.cloning(Y).M,
		x = euriklis.Mathematics.cloning(X).M,
		i;
	res.Farrar_Glauber = new Array();
	for (i = 0; i < x.length; i++)x[i].unshift(parseFloat(Y[i][0]));
	mR = euriklis.Econometrics.partial_R_Matrices(x).partial_R;
	pr = euriklis.Econometrics.partial_R_Matrices(x).partial_r[0];
	for (i = 0; i < pr.length; i++)if (pr[i] < crVal_fg) res.Farrar_Glauber.push({ pr: pr[i], coeff: i });
	res.partial_R_Matrix = mR;
	res.partial_r_Matrix = pr;
	return res;
}
euriklis.Econometrics.TestHypothesis.Multicolinearity.Klein = function (X, Y, ke_t, sign_kl) {
	var X = euriklis.Mathematics.cloning(X),
		arrx, arrR = new Array(), i, j,
		res = new Object(), arrF = new Array();
	var n = X.rows, k = X.columns;
	var F_Pinax = euriklis.Distribution.F_Fisher(k - 1, n - k, sign_kl, 0.000001, 'X');
	x = euriklis.Mathematics.cloning(X);
	res.Klein = new Array();
	for (i = 0; i < X.columns; i++) {
		var nx = euriklis.Mathematics.cloning(x);
		arrx = nx.deleteCol(i);
		arrR[i] = euriklis.Econometrics.OLS(arrx, x.getColumn(i), ke_t).R;
		arrF[i] = euriklis.Econometrics.OLS(arrx, x.getColumn(i), ke_t).F_stat;
		if (arrF[i] > F_Pinax) { res.Klein.push({ R: arrR[i], F: arrF[i], coeff: i }); }
	}
	res.Rj = arrR;
	res.F = arrF;
	res.F_Pinax = F_Pinax;
	return res;
}
euriklis.Econometrics.TestHypothesis.Multicolinearity.VIF = function (X, Y, vife_t) {
	var Rj = euriklis.Econometrics.TestHypothesis.Multicolinearity.Klein(X, Y, vife_t, 0.05).Rj, i, VIF = new Array(), res = new Object();
	res.result = new Array();
	for (i = 0; i < Rj.length; i++) {
		VIF[i] = 1 / (1 - Rj[i]);
		if (VIF[i] > 30) res.result.push({ VIF: VIF[i], coeff: i });
	}
	res.VIF = VIF;
	res.Rj = Rj;
	return res;
}
euriklis.Econometrics.TestHypothesis.Multicolinearity.TOL = function (X, Y, tole_t) {
	var Rj = euriklis.Econometrics.TestHypothesis.Multicolinearity.Klein(X, Y, tole_t, 0.05).Rj, i, TOL = new Array(), res = new Object();
	res.result = new Array();
	for (i = 0; i < Rj.length; i++) {
		TOL[i] = (1 - Rj[i]);
		if (TOL[i] < 0.03) res.result.push({ TOL: TOL[i], coeff: i });
	}
	res.TOL = TOL;
	res.Rj = Rj;
	return res;
}
euriklis.Econometrics.TestHypothesis.Multicolinearity.CL = function (X, Y, cle_t) {
	var xx = euriklis.Econometrics.OLS(X, Y, cle_t).XX, eig = xx.eigenvalue(), res = new Object(), sqrt = Math.sqrt,
		mineig = Math.min.apply(null, eig.real), maxeig = Math.max.apply(null, eig.real),
		cl = (eig.imaginary.every(element => element === 0)) ? sqrt(maxeig / mineig) : false;
	res.CL = cl;
	res.xx = xx;
	res.eig = eig;
	return res;
}
euriklis.Econometrics.TestHypothesis.Multicolinearity.Theil = function (X, Y, the_t) {
	var X = euriklis.Mathematics.cloning(X),
		R = euriklis.Econometrics.OLS(X, Y, the_t).R, n = X.rows, k = X.columns, x, i, j, m = 0, Rj,
		RjArr = new Array(), res = new Object();
	for (i = 0; i < k; i++) {
		var x = euriklis.Mathematics.cloning(X);
		x = x.deleteCol(i);
		Rj = euriklis.Econometrics.OLS(x, Y, the_t).R;
		RjArr.push(Rj);
		m += (Rj - R);
	}
	m += R;
	res.m = m;
	res.R = R;
	res.Rj = RjArr;
	return res;
}
euriklis.Econometrics.PCA = function (X, Y, e_t) {
	/*
	dosen't works temporary!!!
	Principal component analysis method
	see Anastasios Katos, Οικονομετία.Θεωρία και
	εφαρμογές,pp.533 and also Lazaridis,Οικονομετρία Ι,
	pp.402.This function is based on the Lazaridis's book.
	*/
	var inputx = euriklis.Mathematics.cloning(X),
		y = euriklis.Mathematics.cloning(Y),
		sx = inputx.typicalForm(), sy = y.typicalForm();
	var ols = euriklis.Econometrics.OLS(sx, sy, 1);
	dx = inputx.divergenceForm();
	var zz = sx.transpose().times(sx);
	var R = zz;
	var lamda = R.eigenvalue().real;
	//console.log(R.jacobi().eigenvectors);
	var P = R.jacobi().eigenvectors;
	var result = {};
	result['OLS'] = ols;
	result.R = R;
	result.P = P;
	result.lamda = lamda;
	return result;
}
euriklis.Econometrics._IV_ = function (X, Y, Z, ive_t) {
	var n = euriklis.Mathematics.cloning(Z).rows;
	var input_x = euriklis.Mathematics.cloning(X);
	var k = input_x.columns;
	var estimated_x = euriklis.Mathematics.createMatrix(n, 0)
	for (var j = 0; j < k; j++) {
		var xj = input_x.getColumn(j);
		var estimated_xj = euriklis.Econometrics.OLS(Z, xj, ive_t).x.times(euriklis.Econometrics.OLS(Z, xj, ive_t).Coefficients);
		estimated_x.addLastColumn(estimated_xj);
	}
	var iv = euriklis.Econometrics.OLS(estimated_x, Y, ive_t).Coefficients;
	return { IV: iv };
}
euriklis.Econometrics.IV = function (X, Y, Z, ivet_t) {
	var ols = euriklis.Econometrics.OLS(X, Y, ivet_t);
	var xiv = euriklis.Mathematics.cloning(ols.x), yiv = ols.y, ziv = euriklis.Mathematics.cloning(Z);
	var ziva = ziv.columns < xiv.columns ? false : true;
	var variables = ols.variables, observations = ols.observations;
	myiv = yiv.transpose().M[0].toMatrix().SumOfElements() / yiv.rows;
	mmyiv = euriklis.Mathematics.createMatrix(y.rows, 1).setting({ from: [0, 0], to: [y.rows, 1], expression: 'x[i][j] = myiv' });
	var iv = {}, k;
	iv.Coefficients = euriklis.Econometrics._IV_(X, Y, Z, ivet_t).IV;
	iv.alternativeCoefficients = ziva !== false ? ziv.transpose().times(xiv).InverseMatrix().times(ziv.transpose().times(yiv)) : false;
	iv.x = xiv;
	iv.y = yiv;
	iv.z = ziv;
	iv.xx = xiv.transpose().times(xiv);
	iv.e = yiv.minus(xiv.times(iv.Coefficients));
	iv.R = 1 - (iv.e.transpose().times(iv.e).M[0][0] / yiv.minus(mmyiv).transpose().times(yiv.minus(mmyiv)).M[0][0]);
	iv.ESS = iv.e.transpose().times(iv.e).M[0][0];
	iv.Var_S = iv.e.transpose().times(iv.e).times(1 / (observations - variables - 1)).M[0][0];
	iv.Var_b = ziva !== false ? ziv.transpose().times(xiv).InverseMatrix().times(ziv.transpose().times(ziv)).times(xiv.transpose().times(ziv).InverseMatrix()).times(iv.Var_S) : false;
	iv.AdjR = 1 - (((xiv.M.length - 1) / (xiv.M.length - variables - 1)) * (1 - iv.R));
	iv.l = (-1) * (xiv.M.length / 2) * (1 + Math.log(2 * Math.PI) + Math.log((iv.ESS / xiv.M.length)));
	iv.AIC = ((-2) * iv.l / xiv.M.length) + ((2 * (variables + 1)) / xiv.M.length);
	iv.SBIC = ((-2) * iv.l / xiv.M.length) + ((Math.log(xiv.M.length) * (variables + 1)) / xiv.M.length);
	iv.HQ = (iv.ESS / xiv.M.length) * (Math.pow(Math.log(xiv.M.length), ((2 * (variables)) / xiv.M.length)));
	iv.GCV = (iv.ESS / xiv.M.length) * Math.pow((1 - ((variables) / xiv.M.length)), -2);
	iv.RICE = (iv.ESS / xiv.M.length) * Math.pow((1 - (2 * (variables) / xiv.M.length)), -1);
	iv.SH = (iv.ESS / xiv.M.length) * ((xiv.M.length + 2 * (variables)) / xiv.M.length);
	iv.PC = (iv.ESS / (xiv.M.length - variables)) * ((xiv.M.length + variables) / xiv.M.length);
	iv.F = (iv.R / (xiv.M[0].length - 1)) / ((1 - iv.R) / (xiv.M.length - variables - 1));
	var aiv = euriklis.Mathematics.createMatrix(observations, observations).setting({ from: [0, 0], to: [observations, observations], expression: 'x[i][j] = ((i==0&&j==0)||(i==this.rows-1&&j==this.rows-1))?1:(i==j)?2:(i==j+1)?-2:0' });
	iv.DW = iv.e.transpose().times(aiv).times(iv.e).M[0][0] / iv.ESS;
	return iv;
}
euriklis.Econometrics.IV_Wald_Johnston = function (X, Y, errMeasureCoeff, wje_t) {
	var x = euriklis.Mathematics.cloning(X),
		y = euriklis.Mathematics.cloning(Y), i, j,
		err = errMeasureCoeff;
	temp = x.getColumn(err).transpose().getRow(0).mergeSort();
	var sortedIndices = temp.coefficientsAssigment.toMatrix();
	var centralObservation = Math.ceil(temp.spearmanRank[(x.rows - 3) / 2]);
	if (x.rows % 2 !== 0) {
		x = x.deleteRow(centralObservation);
		y = y.deleteRow(centralObservation);
		sortedIndices = sortedIndices.deleteRow(centralObservation);
		for (i = 0; i < x.rows; i++) {
			if (sortedIndices.M[i][0] > centralObservation) sortedIndices.M[i][0] -= 1;
		}
	}
	var n = x.rows, k = x.columns, z = euriklis.Mathematics.createMatrix(n, 1);
	for (j = 0; j < n; j++)z.M[sortedIndices.M[j][0]][0] = sortedIndices.M[j][0] >= n / 2 ? 1 : -1;
	return euriklis.Econometrics.IV(x, y, z, wje_t);
}
euriklis.Graphics = function Graph(config) {
	// user defined properties
	this.canvas = document.getElementById(config.canvasId);
	this.minX = config.minX;
	this.minY = config.minY;
	this.maxX = config.maxX;
	this.maxY = config.maxY;
	this.unitsPerTick = config.unitsPerTick;

	// constants
	this.axisColor = '#aaa';
	this.font = '8pt Calibri';
	this.tickSize = config.tickSize;
	this.comentText = config.comentText;

	// relationships
	this.context = this.canvas.getContext('2d');
	this.rangeX = this.maxX - this.minX;
	this.rangeY = this.maxY - this.minY;
	this.unitX = this.canvas.width / this.rangeX;
	this.unitY = this.canvas.height / this.rangeY;
	this.centerY = Math.round(Math.abs(this.minY / this.rangeY) * this.canvas.height);
	this.centerX = Math.round(Math.abs(this.minX / this.rangeX) * this.canvas.width);
	this.iteration = (this.maxX - this.minX) / 1000;
	this.scaleX = this.canvas.width / this.rangeX;
	this.scaleY = this.canvas.height / this.rangeY;

	// draw x and y axis
	this.drawXAxis();
	this.drawYAxis();
}

euriklis.Graphics.prototype.drawXAxis = function () {
	var context = this.context;
	context.save();
	context.beginPath();
	context.moveTo(0, this.centerY);
	context.lineTo(this.canvas.width, this.centerY);
	context.strokeStyle = this.axisColor;
	context.lineWidth = 2;
	context.stroke();

	// draw tick marks
	var xPosIncrement = this.unitsPerTick * this.unitX;
	var xPos, unit;
	context.font = this.font;
	context.textAlign = 'center';
	context.textBaseline = 'top';

	// draw left tick marks
	xPos = this.centerX - xPosIncrement;
	unit = -1 * this.unitsPerTick;
	while (xPos > 0) {
		context.moveTo(xPos, this.centerY - this.tickSize / 2);
		context.lineTo(xPos, this.centerY + this.tickSize / 2);
		context.stroke();
		context.fillText(unit, xPos, this.centerY + this.tickSize / 2 + 3);
		unit -= this.unitsPerTick;
		xPos = Math.round(xPos - xPosIncrement);
	}

	// draw right tick marks
	xPos = this.centerX + xPosIncrement;
	unit = this.unitsPerTick;
	while (xPos < this.canvas.width) {
		context.moveTo(xPos, this.centerY - this.tickSize / 2);
		context.lineTo(xPos, this.centerY + this.tickSize / 2);
		context.stroke();
		context.fillText(unit, xPos, this.centerY + this.tickSize / 2 + 3);
		unit += this.unitsPerTick;
		xPos = Math.round(xPos + xPosIncrement);
	}
	context.restore();
};
euriklis.Graphics.prototype.drawYAxis = function () {
	var context = this.context;
	context.save();
	context.beginPath();
	context.moveTo(this.centerX, 0);
	context.lineTo(this.centerX, this.canvas.height);
	context.strokeStyle = this.axisColor;
	context.lineWidth = 2;
	context.stroke();

	// draw tick marks
	var yPosIncrement = this.unitsPerTick * this.unitY;
	var yPos, unit;
	context.font = this.font;
	context.textAlign = 'right';
	context.textBaseline = 'middle';

	// draw top tick marks
	yPos = this.centerY - yPosIncrement;
	unit = this.unitsPerTick;
	while (yPos > 0) {
		context.moveTo(this.centerX - this.tickSize / 2, yPos);
		context.lineTo(this.centerX + this.tickSize / 2, yPos);
		context.stroke();
		context.fillText(unit, this.centerX - this.tickSize / 2 - 3, yPos);
		unit += this.unitsPerTick;
		yPos = Math.round(yPos - yPosIncrement);
	}

	// draw bottom tick marks
	yPos = this.centerY + yPosIncrement;
	unit = -1 * this.unitsPerTick;
	while (yPos < this.canvas.height) {
		context.moveTo(this.centerX - this.tickSize / 2, yPos);
		context.lineTo(this.centerX + this.tickSize / 2, yPos);
		context.stroke();
		context.fillText(unit, this.centerX - this.tickSize / 2 - 3, yPos);
		unit -= this.unitsPerTick;
		yPos = Math.round(yPos + yPosIncrement);
	}
	context.restore();
};
euriklis.Graphics.prototype.drawEquation = function (equation, color, thickness, text, textCor) {
	var context = this.context;
	context.save();
	context.save();
	this.transformContext();

	context.beginPath();
	context.moveTo(this.minX, equation(this.minX));

	for (var x = this.minX + this.iteration; x <= this.maxX; x += this.iteration) {
		context.lineTo(x, equation(x));
	}

	context.restore();
	context.lineJoin = 'round';
	context.lineWidth = thickness;
	context.strokeStyle = color;
	context.stroke();
	//context.fillStyle = color;
	//context.fill();
	context.restore();
	context.font = this.font;
	context.moveTo(textCor.x, textCor.y);
	context.lineTo(textCor.x + 5, textCor.y);
	context.strokeStyle = color;
	context.stroke();
	context.fillText(text, textCor.x + 8, textCor.y);
};
euriklis.Graphics.prototype.transformContext = function () {
	var context = this.context;

	// move context to center of canvas
	this.context.translate(this.centerX, this.centerY);

	/*
	 * stretch grid to fit the canvas window, and
	 * invert the y scale so that that increments
	 * as you move upwards
	 */
	context.scale(this.scaleX, -this.scaleY);
};
/*
euriklis.load = function(_data_){
		  $('head').append('<script id = "example" type = "text/javascript" src = "examples/'+_data_+ '"></script>');
	  }
euriklis.deload = function(){
		  $('head #example').remove();
}*/
euriklis.Finance = new Object();
euriklis.Finance.Bonds = function (coupon, faceValue) {
	this.C = coupon * faceValue;
	this.F = faceValue;
}
euriklis.Finance.Bonds.prototype.PV = function (t, periods, yield) {
	/*PV = sum{c/periods/(1+r)^i}+FV/(1+r)^n*/
	var PV, c = this.C / periods, n = t * periods;
	var FV = this.F,
		r = (yield / periods);
	discount = Math.pow(1 + r, n);
	//for(i = 1;i <= n;i++)PV+=c/=1+r;
	PV = (c / r) * (1 - 1 / discount) + FV / discount;
	return PV;
}
euriklis.Finance.Bonds.prototype.yield = function (t, periods, marketPrice) {
	var i, yield = new Array(), n = t * periods,
		b = marketPrice, c = (this.C / periods),
		equation = b.toString() + 'x^' + (n + 1).toString() + '-' + (b + c) + 'x^' + n + '-' + (this.F) + 'x+' + (this.F + c);
	var eqRoots = new euriklis.Mathematics.polynomial('x', equation).roots();
	for (i = 0; i < eqRoots.real.length; i++)if ((Math.abs(eqRoots.imaginary[i]) < 1e-10) && eqRoots.real[i] > 0) if (Math.abs(eqRoots.real[i] - 1) > 1e-10) yield.push(periods * (eqRoots.real[i] - 1));
	return yield;
}
euriklis.Finance.Bonds.prototype.rcy = function (t, periods, currentPrice, new_r) {
	return Math.pow((this.F + this.C * (Math.pow(1 + new_r / periods, t * periods) - 1) / new_r) / currentPrice, 1 / (t * periods)) - 1;
}
euriklis.Finance.Bonds.prototype.D =
	euriklis.Finance.Bonds.prototype.duration =
	euriklis.Finance.Bonds.prototype.Macaulay = function (maturity, periods, r) {
		var t, n = maturity * periods;
		var duration = 0, c = this.C / periods;
		var P = new euriklis.Finance.Bonds(this.C / this.F, this.F).PV(maturity, periods, r);
		for (t = 1; t <= n; t++)duration += t * (c /= (1 + (r / periods)));
		duration += n * this.F / Math.pow(1 + r / periods, n);
		duration /= P * periods;
		return duration;
	}
euriklis.Finance.Bonds.prototype.modifiedDuration =
	euriklis.Finance.Bonds.prototype.MD = function (n, periods, r) {
		return this.duration(n, periods, r) / (1 + r / periods);
	}
euriklis.Finance.Bonds.prototype.convexity = function (t, periods, yield) {
	var mult = (1 + yield / periods),
		mult1 = 1, i, convexity = 0.0, n = t * periods, c = this.C / periods;
	for (i = 1; i <= n; i++)convexity += i !== n ? (c / Math.pow(mult, i)) * (i * i + i) : ((c + this.F) / Math.pow(mult, i)) * (i * i + i);
	convexity /= (periods * periods * mult * mult * this.PV(t, periods, yield));
	return convexity;
}
euriklis.Finance.loans = function (properties) {
	this.loan = properties.loan;
	this.years = properties.years;
	this.periods = properties.periods;
	this.r = properties.r;
	this.pmt = properties.pmt;
}
euriklis.Finance.loans.prototype.PMT = function () {
	var pmt = (this.years && this.periods && this.r &&
		this.loan && typeof (this.pmt) === 'undefined' &&
		typeof (this.years) !== 'undefined' &&
		typeof (this.periods) !== 'undefined' &&
		typeof (this.r) !== 'undefined' &&
		typeof (this.loan) !== 'undefined') ?
		((this.r / this.periods) * this.loan) / (1 - Math.pow(1 + this.r / this.periods, -this.periods * this.years)) :
		euriklis.nrerror('Uncorrect input in the pmt loans routine!');
	return new euriklis.Finance.loans(
		{
			pmt: pmt,
			years: this.years,
			periods: this.periods,
			loan: this.loan,
			r: this.r
		});
}
euriklis.Finance.loans.prototype.total = function () {
	var total = (typeof this.pmt !== 'undefined' &&
		this.r && this.periods && this.years && this.loan) ?
		this.pmt * this.periods * this.years :
		(typeof this.pmt === 'undefined' &&
			this.r && this.periods && this.years && this.loan) ?
			this.PMT().pmt * this.periods * this.years :
			euriklis.nrerror('Uncorrect input in total loans routine!');
	return {
		total: total,
		'interest paid': total - this.loan
	};
}
euriklis.Finance.loans.prototype.schedule = function () {
	/*
	This routine computes the amortization schedules 
	of a loan like euriklis-matrix object in the following
	order:[period,iterest paid, principal,balance].
	If some of the loan parameters is forgotten, 
	the routine throws an error exception!The formulas 
	for obtaining of the schedules are:
	Interest(k) = pmt*(1-(1+r/periods)^k*pi),
	principal(k) = (1+r/periods)^k*pi*pmt;
	balance(k) = pmt/(r/periods))*(1 - (1+r/periods)^k*pi).
	Because of optimization process in routine are used 
	recurrence formulas.
	*/
	var i, n = this.periods * this.years,
		schedule = euriklis.Mathematics.
			createMatrix(this.periods * this.years, 4);
	var Undefined = function (_type_) {
		return typeof _type_ === 'undefined';
	}
	var pmt = (!Undefined(this.pmt) && !Undefined(this.years) && !Undefined(this.r) && !Undefined(this.periods) &&
		!Undefined(this.loan)) ? this.pmt :
		(Undefined(this.pmt) && !Undefined(this.years) && !Undefined(this.r) && !Undefined(this.periods) &&
			!Undefined(this.loan)) ? this.PMT().pmt :
			euriklis.nrerror('Uncorrect input in schedule loans routine!');
	var pi = 1;
	for (i = 1; i <= n; i++)pi /= (1 + this.r / this.periods);
	for (i = 1; i <= n; i++) {
		schedule.M[i - 1][0] = i;
		schedule.M[i - 1][1] = i === 1 ? (this.r / this.periods * this.loan) :
			(this.r / this.periods) * schedule.M[i - 2][3];
		schedule.M[i - 1][2] = pmt - schedule.M[i - 1][1];
		schedule.M[i - 1][3] = (pmt / (this.r / this.periods)) * (1 - Math.pow(1 + this.r / this.periods, i) * pi);
	}
	return schedule;
}
euriklis.Finance.retire = function (properties) {
	this.pmt = properties.pmt;
	this.r = properties.r;
	this.years = properties.years;
	this.periods = properties.periods;
	this.payoff = properties.payoff;
	this.duration = properties.duration;
}
euriklis.Finance.retire.prototype.PMT = function () {
	var pvpayoff = this.duration === 0 ? this.payoff :
		(this.payoff / this.r) * (1 - Math.pow(1 + this.r, -this.duration));
	var pvpmt = pvpayoff * Math.pow(1 + this.r, -this.periods * this.years);
	return new euriklis.Finance.loans({ years: this.years, periods: this.periods, r: this.r, loan: pvpmt }).PMT().pmt;
}
euriklis.Finance.portfolio = function (obj) {
	this.d = obj.d;
	this.shares = obj.shares ? euriklis.Mathematics.cloning(obj.shares) : 'undefined';
	this.cov = obj.cov ? euriklis.Mathematics.cloning(obj.cov) : 'undefined';
	this.m = obj.m ? euriklis.Mathematics.cloning(obj.m) : 'undefined';
}
euriklis.Finance.portfolio.prototype.parameters = function () {
	var i, H = this.cov !== 'undefined' ? this.cov : euriklis.Econometrics.correlationMatrix(this.shares), m;
	if (this.m == 'undefined') {
		this.m = euriklis.Mathematics.createMatrix(1, this.shares.columns);
		for (i = 0; i < this.shares.columns; i++) {
			this.m.M[0][i] = euriklis.Econometrics.MEAN(this.shares.rdiff().getColumn(i).transpose().M[0]);
		}
	}
	//m = this.m ? this.m : m;
	return { m: this.m, cov: H };
}
euriklis.Finance.portfolio.prototype.Markowitz = function (mreturn) {
	var m = this.parameters().m, a, b, c, d, lambda, gamma, g, h,
		H = this.parameters().cov.InverseMatrix(), sigma,
		one = euriklis.Mathematics.createMatrix(1, H.rows).setting({ from: [0, 0], to: [1, H.rows], expression: 'this.M[i][j] = 1.0' });
	a = one.times(H).times(m.transpose()).M[0][0];
	b = m.times(H).times(m.transpose()).M[0][0];
	c = one.times(H).times(one.transpose()).M[0][0];
	d = b * c - a * a;
	lambda = (c * m.times(one.transpose()).M[0][0] - a) / d;
	gamma = (b - m.times(one.transpose()).M[0][0] * a) / d;
	g = H.times(b).times(one.transpose()).minus(H.times(a).times(m.transpose())).times(1 / d);
	h = H.times(c).times(m.transpose()).minus(H.times(a).times(one.transpose())).times(1 / d);
	sigma = 1 / c + (mreturn - a / c) * (mreturn - a / c) * (c / d);
	return {
		g: g,
		h: h,
		weights_zero: g.plus(h.times(a / c)),
		weights: g.plus(h.times(mreturn)),
		lambda: lambda,
		gamma: gamma,
		mean_zero: m.times(g.plus(h.times(a / c))).M[0][0],
		sigma_zero: 1 / c,
		sigma: sigma
	};
}
euriklis.Finance.portfolio.prototype.tangentPortfolio = function (InterestRate) {
	var m = this.parameters().m, a, beta, c, w, lambda, x,
		H = this.parameters().cov.InverseMatrix(), tangent,
		one = euriklis.Mathematics.createMatrix(1, H.rows).setting({ from: [0, 0], to: [1, H.rows], expression: 'this.M[i][j] = 1.0' });
	a = one.times(H).times(m.transpose()).M[0][0];
	c = one.times(H).times(one.transpose()).M[0][0];
	x = m.minus(one.times(InterestRate));
	lambda = 1 / (a - c * InterestRate);
	w = H.times(lambda).times(x.transpose());
	sigmaPortfolio = lambda * (x.times(w).M[0][0]);
	sigmaShares = x.transpose().times(lambda);
	beta = sigmaShares.times(1 / sigmaPortfolio);
	tangent = Math.sqrt(x.times(H).times(x.transpose()).M[0][0]);
	return {
		weights: w,
		lambda: lambda,
		mean: x.times(w).M[0][0] + InterestRate,
		sigmaPortfolio: sigmaPortfolio,
		sigmaShares: sigmaShares,
		beta: beta,
		tangent: tangent
	};
}
euriklis.Finance.portfolio.prototype.constrainedMarkowitz = function (constraints) {
	var m = this.parameters().m.M[0], cov = this.parameters().cov.times(2).M;
	/*
	 * the constraints object contains the following features:
	 * 1.key meq --> the number of the equality constraints,
	 * first writen in the matrix amat. 
	 * 2.key mle --> the number of second writen '<=' type constraints
	 * 3.key amat --> the matrix of the constraints.
	 * 4.key bvec --> the limits vector.
	 */
	var imle, j, one = euriklis.Mathematics.createMatrix(1, m.length).setting({ from: [0, 0], to: [1, m.length], expression: 'this.M[i][j] = 1.0' }).M[0],
		amat = constraints.amat.toMatrix().addFirstRow(one).addLastRow(m).M,
		bvec = constraints.bvec,
		dvec = euriklis.Mathematics.createMatrix(1, m.length).setting({ from: [0, 0], to: [1, m.length], expression: 'this.M[i][j] = 0.0' }).M[0],
		meq = typeof constraints.meq === 'undefined' ? 1 : 1 + constraints.meq,
		mle = typeof constraints.mle === 'undefined' ? 0 : constraints.mle, x;
	bvec.unshift(1);
	bvec.push(0);
	/* check for error: */
	if ((meq + mle) > amat.rows - 1) euriklis.nrerror('constrainted Markowitz error');
	/* modify the amat for '<=' constraints type */
	for (imle = meq; imle < (meq + mle); imle++) {
		bvec[imle] *= -1;
		for (j = 0; j < amat[i].length; j++)amat[imle][j] *= -1;
	}
	amat = amat.toMatrix().transpose().M;
	/* find the optimal x with the euriklis.....solveQP function */
	x = euriklis.Mathematics.programming.solveQP(cov, dvec, amat, bvec, meq);
	return { weights: [x.solution].toMatrix().transpose(), sigma: Math.sqrt(x.value), mean: [m].toMatrix().times([x.solution].toMatrix().transpose()).M[0][0] };
}
euriklis.Mathematics.programming.KKT_QP = function (c, Q, A, b) {
	var i, j, cln = euriklis.Mathematics.cloning,
		c = cln(c), a = cln(A), q = cln(Q), b = cln(b), ar = a.rows,
		ac = a.columns, qr = q.rows, qc = q.columns, c_obj, b_obj,
		largea = euriklis.Mathematics.createMatrix(q.rows + a.rows, q.rows + q.columns + 2 * a.rows);
	for (i = 0; i < largea.rows; i++) {
		for (j = 0; j < largea.columns; j++) {
			largea.M[i][j] = (i < qr && j < qc) ? q.M[i][j] :
				(i < ac && j >= qc && j < (ar + qc)) ? a.transpose().M[i][j - qc] :
					(i >= qr && j < ac) ? a.M[i - qr][j] :
						(i >= qr && j >= ac && j < qc + ar) ? 0.0 :
							(i < qr && j >= ar + qc && i === (j - qc - ar)) ? -1.0 :
								(i >= qr && j >= ar + qc && i === (j - qc - ar)) ? 1.0 : 0.0;
		}
	}
	c_obj = euriklis.Mathematics.createMatrix(1, largea.columns).setting({ from: [0, 0], to: [1, largea.columns], expression: 'this.M[i][j] = 0.0' });
	var b_obj = euriklis.Mathematics.createMatrix(1, largea.rows);
	for (i = 0; i < largea.rows; i++) {
		b_obj.M[0][i] = i < c.columns ? -c.M[0][i] : b.M[0][i - c.columns];
	}
	var simplex = euriklis.Mathematics.programming.simplex;
	var opt = simplex(largea, b_obj, c_obj, b_obj.columns, 0, 'min');
	return opt;
}
euriklis.Finance.portfolio.prototype.solve = function (l) {
	var cov = this.parameters().cov.times(2).M,
		m = this.parameters().m.M[0], i, j, c = [], k = [], e = [],
		invc, x, z = [], lambda = [[], []], n = m.length;
	/* create the c,k and e matrices: */
	for (i = 0; i <= n; i++) {
		c[i] = [];
		k[i] = i < n ? [0] : [1];
		e[i] = i < n ? [m[i]] : [0];
		for (j = 0; j <= n; j++) {
			c[i][j] = i < n && j < n ? cov[i][j] :
				i === n && j === n ? 0 : 1;
		}
	}
	c = c.toMatrix();
	k = k.toMatrix();
	e = e.toMatrix();
	/* compute the inese c matrix: */
	invc = c.InverseMatrix();
	/* compute the z: */
	z[0] = invc.times(k).M;
	z[1] = invc.times(e).M;
	for (i = 0; i < n; i++) {
		lambda[0][i] = (0.0 - z[0][i]) / z[1][i];
		lambda[1][i] = (1.0 - z[0][i]) / z[1][i];
	}
	x = typeof l === 'undefined' ? invc.times(k) : invc.times(k.plus(e.times(l)));
	var output = {};
	output.weights = x.getBlock([0, 0], [x.rows - 2, 0]).transpose();
	output.gamma = x.M[x.rows - 1][0];
	output.sigma = Math.sqrt(x.getBlock([0, 0], [x.rows - 2, 0])
		.transpose().times(this.parameters().cov)
		.times(x.getBlock([0, 0], [x.rows - 2, 0])).M[0][0]);
	output.mean = x.transpose().times(e).M[0][0];
	return output;
}
__run(params)
}
module.exports = euriklis;


/**
 * utility function:
 */

Object.prototype.isEmpty = function () {
	'use strict';
	for (let key in this) {
		if (this.hasOwnProperty(key))
			return false;
	}
	return true;
}
