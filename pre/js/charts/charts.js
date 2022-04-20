//Desarrollo de las visualizaciones
import * as d3 from 'd3';
require('./sellect');
import { numberWithCommas2 } from '../helpers';
//import { getInTooltip, getOutTooltip, positionTooltip } from './modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42',
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0',
COLOR_GREY_1 = '#D6D6D6', 
COLOR_GREY_2 = '#A3A3A3',
COLOR_ANAG__PRIM_1 = '#BA9D5F', 
COLOR_ANAG_PRIM_2 = '#9E6C51',
COLOR_ANAG_PRIM_3 = '#9E3515',
COLOR_ANAG_COMP_1 = '#1C5A5E';

export function initChart(iframe) {
    //Creación de otros elementos relativos al gráfico que no requieran lectura previa de datos > Selectores múltiples o simples, timelines, etc 

    //Lectura de datos
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_demografia_1_5/main/data/piramide_2021_tamanos_nacional.csv', function(error,data) {
        if (error) throw error;

        //SELECCIÓN DE ELEMENTOS
        let selectedArr = ['Nacional'];
        let mySellect = sellect("#my-element", {
            originList: ['Entre 0 y 2.000 habitantes','Entre 2.001 y 5.000','Entre 5.001 y 10.000','Entre 10.001 y 20.000','Entre 50.001 y 100.000',,'Entre 100.001 y 500.000','500.001 y más','Nacional'],
            destinationList: ['Nacional'],
            onInsert: onChange
        });

        function onChange() {
            selectedArr = mySellect.getSelected();
            setPyramids(selectedArr, currentType);
        }

        mySellect.init();

        /////////////////VISUALIZACIÓN DE PIRÁMIDES///////////////
        ///Dividir los datos
        let currentType = 'Porcentajes';

        ///Valores iniciales de altura, anchura y márgenes > Primer desarrollo solo con Valores absolutos
        let margin = {top: 5, right: 25, bottom: 20, left: 70},
            width = document.getElementById('chart').clientWidth - margin.left - margin.right,
            height = width * 0.67 - margin.top - margin.bottom;

        let svg = d3.select("#chart")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let x = d3.scaleLinear()
            .domain([-1.5,1.5])
            .range([0,width]);

        let xM = d3.scaleLinear()
            .domain([1.5,0])
            .range([0, width / 2]);

        let xF = d3.scaleLinear()
            .domain([0,1.5])
            .range([width / 2, width]);

        let xAxis = function(svg) {
            svg.call(d3.axisBottom(x).ticks(6).tickFormat(function(d) { return numberWithCommas3(Math.abs(d)); }));
            svg.call(function(g){
                g.selectAll('.tick line')
                    .attr('class', function(d,i) {
                        if (d == 0) {
                            return 'line-special';
                        }
                    })
                    .attr('y1', '0')
                    .attr('y2', `-${height}`)
            });
        }

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr('class','x-axis')
            .call(xAxis);

        let y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(function(item) { return item.Edad; }).reverse())
            .padding(.1);

        let yAxis = function(svg) {
            svg.call(d3.axisLeft(y).tickValues(y.domain().filter(function(d,i){ return !(i%10)})));
            svg.call(function(g){g.selectAll('.tick line').remove()});
        }

        svg.append("g")
            .call(yAxis);

        function setPyramids(types, currentType) {

            //Borrado de datos
            svg.selectAll('.chart-g')
                .remove()
                .exit();

            //Lógica en eje
            if (currentType == 'Absolutos') {

                if(types.indexOf('nacional') != -1) {
                    x.domain([-500000,500000]);
                    svg.select(".x-axis").call(xAxis);                
                    xM.domain([500000,0]);
                    xF.domain([0,500000]);
                } else {
                    x.domain([-100000,100000]);
                    svg.select(".x-axis").call(xAxis);                
                    xM.domain([100000,0]);
                    xF.domain([0,100000]);
                }
                
            } else {
                x.domain([-1.5,1.5]);
                svg.select(".x-axis").call(xAxis);
                xM.domain([1.5,0]);
                xF.domain([0,1.5]);
            }

            //Lógica en pirámides
            for (let i = 0; i < types.length; i++) {

                let auxData = data.filter(function(item) { if (item.Tipo == types[i] && item.Data == currentType) { return item; }});

                console.log(auxData, types[i], currentType);

                if(types[i] != 'nacional') {
                    svg.append("g")
                        .attr('class', 'chart-g')
                        .selectAll("rect")
                        .data(auxData)
                        .enter()
                        .append("rect")
                        .attr('class', 'prueba')
                        .attr("fill", function(d) { if(d.Sexo == 'Hombres') { return COLOR_PRIMARY_1; } else { return COLOR_COMP_1; }})
                        .style('opacity', function() {
                            let opacity = '';
                            switch(types[i]) {
                                case 'entre0y2000':
                                    opacity = '0.95';
                                    break;
                                case 'entre2001y5000':
                                    opacity = '0.875';
                                    break;
                                case 'entre5001y10000':
                                    opacity = '0.8';
                                    break;
                                case 'entre10001y20000':
                                    opacity = '0.725';
                                    break;
                                case 'entre20001y50000':
                                    opacity = '0.65';
                                    break;
                                case 'entre50001y100000':
                                    opacity = '0.575';
                                    break;
                                case 'entre100001y500000':
                                    opacity = '0.5';
                                    break;
                                case '500001ymas':
                                    opacity = '0.425';
                                    break;
                                default:
                                    opacity = '0.95';
                                    break;
                            }
                            return opacity;
                        })
                        .attr("x", function(d) { if(d.Sexo == 'Hombres') { return xM(d.Valor); } else { return xF(0); }})
                        .attr("y", function(d) { return y(d.Edad); })
                        .attr("width", function(d) { if(d.Sexo == 'Hombres') { return xM(0) - xM(d.Valor); } else { return xF(d.Valor) - xF(0); }})
                        .attr("height", y.bandwidth());

                } else {

                    svg.append("g")
                    .attr('class', 'chart-g')
                    .selectAll("rect")
                    .data(auxData)
                    .enter()
                    .append("rect")
                    .attr('class', 'prueba')
                    .attr('fill','none')
                    .attr("stroke", function(d) { if(d.Sexo == 'Hombres') { return COLOR_PRIMARY_1; } else { return COLOR_COMP_1; }})
                    .attr("stroke-width",'3px')
                    .style('opacity', '0.5')
                    .attr("x", function(d) { if(d.Sexo == 'Hombres') { return xM(d.Valor); } else { return xF(0); }})
                    .attr("y", function(d) { return y(d.Edad); })
                    .attr("width", function(d) { if(d.Sexo == 'Hombres') { return xM(0) - xM(d.Valor); } else { return xF(d.Valor) - xF(0); }})
                    .attr("height", y.bandwidth());
                }
                
            }

        }

        ////////////
        ////////////RESTO
        ////////////
        setPyramids(selectedArr, currentType);

        //Uso de dos botones para ofrecer datos absolutos y en miles
        document.getElementById('data_absolutos').addEventListener('click', function() {
            //Cambiamos color botón
            document.getElementById('data_porcentajes').classList.remove('active');
            document.getElementById('data_absolutos').classList.add('active');

            //Cambiamos valor actual
            currentType = 'Absolutos';

            //Cambiamos gráfico
            setPyramids(selectedArr, currentType);            
        });

        document.getElementById('data_porcentajes').addEventListener('click', function() {
            //Cambiamos color botón
            document.getElementById('data_porcentajes').classList.add('active');
            document.getElementById('data_absolutos').classList.remove('active');

            //Cambiamos valor actual
            currentType = 'Porcentajes';

            //Cambiamos gráfico
            setPyramids(selectedArr, currentType);            
        });

        //Animación del gráfico
        document.getElementById('replay').addEventListener('click', function() {
            setPyramids(selectedArr, currentType);
        });

        //Iframe
        setFixedIframeUrl('informe_perfil_mayores_2022_demografia_1_5','piramide_espanoles_extranjeros');

        //Redes sociales > Antes tenemos que indicar cuál sería el texto a enviar
        setRRSSLinks('piramide_espanoles_extranjeros');

        //Captura de pantalla de la visualización
        setChartCanvas();

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('piramide_espanoles_extranjeros');
        });

        //Altura del frame
        setChartHeight(iframe);
    });    
}