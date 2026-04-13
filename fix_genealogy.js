const fs = require('fs');
const path = require('path');

const filePath = './GenealogyTree.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Replace the layout algorithm
const oldLayout = `    // Calculate radial positions - mind map style with center root
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const baseRadius = Math.min(dimensions.width, dimensions.height) * 0.25;

    // Group by generation
    const generationGroups = new Map<number, TreeNode[]>();
    nodes.forEach(node => {
      const gen = node.generation;
      if (!generationGroups.has(gen)) generationGroups.set(gen, []);
      generationGroups.get(gen)!.push(node);
    });

    // Position nodes by generation - each generation in a ring
    generationGroups.forEach((group, gen) => {
      const radius = baseRadius + (gen * baseRadius * 0.8);
      const totalInGen = group.length;
      
      group.forEach((node, idx) => {
        if (node.id === centerNode) {
          // Center node at center
          node.x = centerX;
          node.y = centerY;
        } else {
          // Other nodes in a circle around center
          const angle = (idx / Math.max(totalInGen, 1)) * 2 * Math.PI - Math.PI / 2;
          node.x = centerX + Math.cos(angle) * radius;
          node.y = centerY + Math.sin(angle) * radius;
        }
      });
    });`;

const newLayout = `    // Calculate radial positions - IMPROVED mind map style with proper centering
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Calculate proper max radius to use available space efficiently
    const minDim = Math.min(dimensions.width, dimensions.height);
    const padding = 120; // Space for labels and node radius
    const maxRadius = (minDim / 2) - padding;
    
    // Group nodes by generation and find max generation
    const generationGroups = new Map<number, TreeNode[]>();
    let maxGeneration = 0;
    nodes.forEach(node => {
      maxGeneration = Math.max(maxGeneration, node.generation);
      if (!generationGroups.has(node.generation)) {
        generationGroups.set(node.generation, []);
      }
      generationGroups.get(node.generation).push(node);
    });
    
    // Ring spacing calculated to evenly distribute all generations
    const ringSpacing = maxGeneration > 1 ? maxRadius / maxGeneration : maxRadius * 0.5;
    
    // Position nodes by generation - each generation in concentric rings
    generationGroups.forEach((group, gen) => {
      const ringRadius = gen === 0 ? 0 : ringSpacing * gen;
      const totalInGen = group.length;
      
      group.forEach((node, idx) => {
        if (node.id === centerNode || gen === 0) {
          // ROOT NODE ALWAYS at exact center
          node.x = centerX;
          node.y = centerY;
        } else {
          // Distribute ring nodes with generation-based angle offset
          const angleOffset = (gen % 2 === 0) ? 0 : Math.PI / (totalInGen * 2);
          const angle = ((idx + angleOffset) / Math.max(totalInGen, 1)) * 2 * Math.PI - Math.PI / 2;
          
          node.x = centerX + Math.cos(angle) * ringRadius;
          node.y = centerY + Math.sin(angle) * ringRadius;
        }
      });
    });`;

content = content.replace(oldLayout, newLayout);

// Fix 2: Replace the bezier connection
const oldBezier = `        {/* Connection to parent */}
        {node.parentId && (
          <path
            d={\`M \${treeNodes.find(n => n.id === node.parentId)?.x || 0} \${treeNodes.find(n => n.id === node.parentId)?.y || 0} 
                Q \${(treeNodes.find(n => n.id === node.parentId)?.x || 0) + node.x} / 2, \${(treeNodes.find(n => n.id === node.parentId)?.y || 0) + node.y} / 2
                \${node.x} \${node.y}\`}
            fill="none"
            stroke={isSelected ? '#fbbf24' : isMale ? '#6366f1' : '#ec4899'}
            strokeWidth={isSelected ? "3" : "2"}
            strokeOpacity={isSelected ? "0.9" : "0.4"}
            strokeDasharray={isExpanded ? "none" : "5,5"}
          />
        )}`;

const newBezier = `        {/* Curved Bezier connection - FIXED control point calculation */}
        {node.parentId && (() => {
          const parentNode = treeNodes.find(n => n.id === node.parentId);
          if (!parentNode) return null;
          
          const startX = parentNode.x;
          const startY = parentNode.y;
          const endX = node.x;
          const endY = node.y;
          
          // FIXED: Proper bezier control point with perpendicular offset
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          const dx = endX - startX;
          const dy = endY - startY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const curveOffset = Math.min(dist * 0.25, 50);
          const perpX = -dy / dist * curveOffset;
          const perpY = dx / dist * curveOffset;
          
          return (
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              d={\`M \${startX} \${startY} Q \${midX + perpX} \${midY + perpY} \${endX} ${endY}\`}
              fill="none"
              stroke={isSelected ? '#fbbf24' : isMale ? '#6366f1' : '#ec4899'}
              strokeWidth={isSelected ? "2.5" : "1.5"}
              strokeOpacity={isSelected ? "0.95" : "0.45"}
              strokeDasharray={isExpanded ? "none" : "6,4"}
              strokeLinecap="round"
            />
          );
        })()}`;

content = content.replace(oldBezier, newBezier);

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: All fixes applied');