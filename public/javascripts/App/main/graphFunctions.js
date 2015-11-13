
function loadGraphFunctions(){

	return {
		init: function(graphObject){

			var graph = graphObject.graphInput;
			var graphGL = graphObject.graphGL;

			var maxLinkValue = 0;
			var countAddedNodes = 0;
			
			for (i in graph.nodes){
		        graph.nodes[i].idGL = countAddedNodes;
		        graphGL.addNode(graph.nodes[i].key, graph.nodes[i]);
		        countAddedNodes++;
		    }

		    for (j in graph.links){
		        if (maxLinkValue < graph.links[j].value) maxLinkValue = graph.links[j].value;
			    graphGL.addLink(graph.links[j].source, graph.links[j].target, { connectionStrength: graph.links[j].value , value: graph.links[j].value, color: "#000"});
		    }

		     maxLinkValue += 1;

		     graphObject.maxLinkValue = maxLinkValue;
		},

		initLayout: function(graphObject){

			var idealSpringLength = 1;
			var graphGL = graphObject.graphGL;

			graphObject.layout = Viva.Graph.Layout.forceDirected(graphGL, {
						    	    springLength : idealSpringLength,
						    	    springCoeff : 0.0003,
						    	    dragCoeff : 0.01,
						    	    gravity : -10,
						    	    theta: 0.8,

							          // This is the main part of this example. We are telling force directed
							          // layout, that we want to change length of each physical spring
							          // by overriding `springTransform` method:
							          springTransform: function (link, spring) {
							            spring.length = idealSpringLength * link.data.connectionStrength;
							          }
						      	});
		},

		initGraphics: function(graphObject){

			var graphicsOptions = {
	          clearColor: true, // we want to avoid rendering artifacts
	          clearColorValue: { // use black color to erase background
	            r: 255,
	            g: 255,
	            b: 255,
	            a: 1
	          }
	        };

			graphObject.graphics = Viva.Graph.View.webglGraphics(graphicsOptions);
			var graphics = graphObject.graphics;

			var circleNode = buildCircleNodeShader();
	        graphics.setNodeProgram(circleNode);

	        var DefaultnodeSize = graphObject.DefaultnodeSize;
	        var nodeColor = graphObject.nodeColor;


	        graphics.node(function (node) {
	          //console.log(node);
	          if (node.id.search('TransitionNode') > -1) sizeToUse = 5;
	          else sizeToUse = DefaultnodeSize+node.data.isolates.length;
	          return new WebglCircle(sizeToUse, nodeColor, [1], [nodeColor], null);
	        });

	        graphics.link(function(link) {
	          return Viva.Graph.View.webglLine(link.data.color, link.id);
	        });

		},

		initRenderer: function(graphObject){

			var graphGL = graphObject.graphGL;

			graphObject.renderer = Viva.Graph.View.renderer(graphGL,
              {
                  container  : document.getElementById( 'visual' ),
                  layout : graphObject.layout,
                  graphics : graphObject.graphics

              });

        	graphObject.renderer.run();

		},

		setPositions: function(graphObject){

			var graph = graphObject.graphInput;
			var layout = graphObject.layout;

			//console.log(graph);

			if (Object.keys(graph.positions).length > 0){
		        for (nodeLocation in graph.positions.nodes[0]){
		          var nodeX = graph.positions.nodes[0][nodeLocation][0].x;
		          var nodeY = graph.positions.nodes[0][nodeLocation][0].y;
		          layout.setNodePosition(nodeLocation, nodeX, nodeY);
		        }
		      }
		},

		precompute: function(graphObject, iterations, callback) {

			var layout = graphObject.layout;
	        // let's run 10 iterations per event loop cycle:
	        var i = 0;
	        while (iterations > 0 && i < 1) {
	          layout.step();
	          iterations--;
	          i++;
	        }
	        $('#processingElement').children().remove();
	        $('#processingElement').append('<div><h3>Layout precompute: ' + iterations+'</h3></div>');
	        if (iterations > 0) {
	          setTimeout(function () {
	              precompute(iterations, callback);
	          }, 0); // keep going in next even cycle
	        } else {
	          // we are done!
	          $('#processingElement').children().remove();
	          callback();
	        }
        }, 



		generateDOMLabels: function(graphObject){

			var graphGL = graphObject.graphGL;
			var graphics = graphObject.graphics;
			var container = graphObject.container;

			var containerPosition = container.getBoundingClientRect();

			var nodeLabels = Object.create(null);
                  graphGL.forEachNode(function(node) {
                    if (node.id.search('TransitionNode') < 0){
                      var label = document.createElement('span');
                      label.classList.add('node-label');
                      label.innerText = node.id;
                      nodeLabels[node.id] = label;
                      container.appendChild(label);
                    }
                    
                  });

                  var countLinks = 0;
                  var treeLinks = {};

                  var linkLabels = Object.create(null);
                  graphGL.forEachLink(function(link) {
                      //console.log(link.id);
                      var label = document.createElement('span');
                      label.classList.add('link-label');
                      label.innerText = parseFloat(link.data.connectionStrength.toFixed(4));
                      treeLinks[link.id] = true;
                      linkLabels[link.id] = label;
                      container.appendChild(label);
                      countLinks += 1;
                    
                    
                  });

                  graphObject.nodeLabels = nodeLabels;
                  graphObject.linkLabels = linkLabels;
                  graphObject.treeLinks = treeLinks;
                  // NOTE: If your graph changes over time you will need to
                  // monitor graph changes and update DOM elements accordingly
                  //return [nodeLabels, linkLabels, treeLinks];

                  graphObject.tovisualizeLabels = false;
		          graphObject.tovisualizeLinkLabels = false;

		          $('.node-label').css('display','none');
		          $('.link-label').css('display','none');

                  graphics.placeNode(function(ui, pos) {
	                  // This callback is called by the renderer before it updates
	                  // node coordinate. We can use it to update corresponding DOM
	                  // label position;

	                  // we create a copy of layout position
	                  var domPos = {
	                      x: pos.x,
	                      y: pos.y
	                  };
	                  // And ask graphics to transform it to DOM coordinates:
	                  graphics.transformGraphToClientCoordinates(domPos);

	                  // then move corresponding dom label to its own position:
	                  var nodeId = ui.node.id;
	                  if (nodeLabels[nodeId] != undefined){
	                    var labelStyle = nodeLabels[nodeId].style;
	                    labelStyle.left = domPos.x + 'px';
	                    labelStyle.top = domPos.y  + 'px';
	                    labelStyle.position = 'absolute';

	                    if (graphObject.tovisualizeLabels){

	                      if (domPos.y + containerPosition.top < containerPosition.top || domPos.y + containerPosition.top > containerPosition.bottom){
	                        labelStyle.display = "none";
	                      }
	                      else if (domPos.x + containerPosition.left < containerPosition.left || domPos.x + containerPosition.left*2 > containerPosition.right){
	                        labelStyle.display = "none";
	                      }
	                      else labelStyle.display = "block";

	                    }
	                  }
                	});

		          graphics.placeLink(function(ui, pos) {
		                  // This callback is called by the renderer before it updates
		                  // node coordinate. We can use it to update corresponding DOM
		                  // label position;
		                  newX = (ui.pos.from.x + ui.pos.to.x) / 2;
		                  newY = (ui.pos.from.y + ui.pos.to.y) / 2;

		                  // we create a copy of layout position

		                  var domPos = {
		                      x: newX,
		                      y: newY,
		                  };
		                  // And ask graphics to transform it to DOM coordinates:
		                  graphics.transformGraphToClientCoordinates(domPos);

		                  // then move corresponding dom label to its own position:
		                  var linkId = ui.idGL;

		                  if (linkLabels[linkId] != undefined){
		                    var labelStyle = linkLabels[linkId].style;
		                    labelStyle.left = domPos.x + 'px';
		                    labelStyle.top = domPos.y  + 'px';
		                    labelStyle.position = 'absolute';
		                    labelStyle.color = 'red';
		                    //console.log(labelStyle);

		                    if (graphObject.tovisualizeLinkLabels){

		                      if (domPos.y + containerPosition.top < containerPosition.top || domPos.y + containerPosition.top > containerPosition.bottom){
		                        labelStyle.display = "none";
		                      }
		                      else if (domPos.x + containerPosition.left < containerPosition.left || domPos.x + containerPosition.left*2 > containerPosition.right){
		                        labelStyle.display = "none";
		                      }
		                      else labelStyle.display = "block";

		                    }
		                  }
		          });
		},

		adjustScale: function(graphObject){

			var layout = graphObject.layout;
			var renderer = graphObject.renderer;

			var graphRect = layout.getGraphRect();
	        var graphSize = Math.min(graphRect.x2 - graphRect.x1, graphRect.y2 - graphRect.y1);
	        var screenSize = Math.min(document.body.clientWidth, document.body.clientHeight);

	        var desiredScale = screenSize / graphSize;

	        zoomOut(desiredScale, 1, renderer);
		},

		searchNodeByID: function(graphObject, inputID){

			var graph = graphObject.graphInput;

			for (var i = 0; i < graph.nodes.length - 1; i++) {
			    optArray.push(String(graph.nodes[i].key));
			}
			optArray = optArray.sort();
			

			$(function () {
			    $(inputID).autocomplete({
			       source: optArray
			    });
			});
		},

		launchGraphEvents: function(graphObject){

			var graphGL = graphObject.graphGL;
			var graphics = graphObject.graphics;
			var layout = graphObject.layout;
			var renderer = graphObject.renderer;

			var events = Viva.Graph.webglInputEvents(graphics, graphGL);

			graphObject.selectedNodes = [],
			graphObject.nodesToCheckLinks = [], 
			graphObject.toRemove = "";


	        var ctrlDown = false, altDown = false, remakeSelection = false, multipleselection = false;

	        events.mouseEnter(function (node) {
	             //console.log('Mouse entered node: ' + node.id);
	         }).mouseLeave(function (node) {
	             //console.log('Mouse left node: ' + node.id);
	         })
	        events.dblClick(function (node, e) {
	          showInfo(graphics, node, e);
	          //
	        }).click(function (node, e) {

	            if (altDown) getLinks(node, graphObject);
	            else if (ctrlDown) SelectNodes(node, graphObject);
	        });

	        var multiSelectOverlay;

	          document.addEventListener('keydown', function(e) {

	            if (e.which == 18) altDown = true;
	          
	            if (e.which === 16 && !multiSelectOverlay) { // shift key
	              multipleselection = false;
	              for (i in graphObject.selectedNodes){
	                var nodeToUse = graphics.getNodeUI(graphObject.selectedNodes[i].id);
	                nodeToUse.colorIndexes = nodeToUse.backupColor;
	              } 
	              graphObject.selectedNodes = [];

	              if(graphObject.isLayoutPaused){
			        renderer.resume();
			        setTimeout(function(){ renderer.pause();}, 5);
			      }
	              
	              multiSelectOverlay = startMultiSelect(graphObject);
	            }

	            if (e.which === 17){
	              ctrlDown = true;
	              if (!multipleselection ){
	                for (i in graphObject.selectedNodes){
	                  var nodeToUse = graphics.getNodeUI(graphObject.selectedNodes[i].id);
	                  nodeToUse.colorIndexes = nodeToUse.backupColor;
	                  //nodeToUse.size = nodeToUse.backupSize;
	                } 
	                remakeSelection = false;
	                graphObject.selectedNodes = [];

	                if(graphObject.isLayoutPaused){
				        renderer.resume();
				        setTimeout(function(){ renderer.pause();}, 5);
				      }
	              }
	            }
	            if (e.which === 87){
	            	if (!graphObject.isLayoutPaused){
		            	renderer.pause();
		                graphObject.isLayoutPaused = true;
		                $('#pauseLayout')[0].innerHTML = "Resume Layout";
		                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',false);
		                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',true);
		            }
		            else{
		            	renderer.resume();
		                graphObject.isLayoutPaused = false;
		                $('#pauseLayout')[0].innerHTML = "Pause Layout";
		                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-play',false);
		                $('#iconPauseLayout').toggleClass('glyphicon glyphicon-pause',true);
		            }
	            }
	          });
	          document.addEventListener('keyup', function(e) {

	            if (e.which === 16 && multiSelectOverlay) {
	              multiSelectOverlay.destroy();
	              multiSelectOverlay = null;

	              graphGL.forEachNode(function(node){
	                var currentNodeUI = graphics.getNodeUI(node.id);
	                if (currentNodeUI.colorIndexes[0][0] == 0xFFA500ff) graphObject.selectedNodes.push(node);
	              });
	              multipleselection = true;

	            }

	            if (e.which === 17){
	              ctrlDown = false;
	            } 

	            if (e.which == 18){

	              altDown = false;
	              restoreLinkSearch(graphObject);
	              graphObject.nodesToCheckLinks = [];
	              toRemove = "";

	            }
	            
	          });
		}
	}
}