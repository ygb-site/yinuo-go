export interface BoardPointInfo {
  coord: string;
  r: number;
  c: number;
  lineNumber: number;
  lineName: string;
  lineTag: string;
  lineDesc: string;
  region: 'corner' | 'side' | 'center';
  regionName: string;
  specialName: string;
  isStarPoint: boolean;
  isTengen: boolean;
  fullTitle: string;
}

export function getPointInfo(r: number, c: number, size: number = 9): BoardPointInfo {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
  const colLetter = letters[c] || String.fromCharCode(65 + c);
  const rowNum = size - r;
  const coord = `${colLetter}${rowNum}`;

  const distTop = r + 1;
  const distBottom = size - r;
  const distLeft = c + 1;
  const distRight = size - c;
  const lineNumber = Math.min(distTop, distBottom, distLeft, distRight);

  let lineName = '一路（死亡线）';
  let lineTag = '死亡线';
  let lineDesc = '气最少，最靠近棋盘悬崖，容易被吃。';
  if (lineNumber === 2) {
    lineName = '二路（败退逃生线）';
    lineTag = '逃生线';
    lineDesc = '用来连接或逃跑求生，很难围出大空。';
  } else if (lineNumber === 3) {
    lineName = '三路（实地地盘线）';
    lineTag = '实地线';
    lineDesc = '围棋黄金线！最容易筑城围取实地地盘。';
  } else if (lineNumber === 4) {
    lineName = '四路（势力宇宙线）';
    lineTag = '势力线';
    lineDesc = '高高站立，向中央放射广阔的大局势力。';
  } else if (lineNumber >= 5) {
    lineName = `${lineNumber}路（中腹天际线）`;
    lineTag = '中腹线';
    lineDesc = '辽阔的中央腹地，战火纷飞的主战场。';
  }

  const isHorizCorner = distLeft <= Math.ceil(size / 3) || distRight <= Math.ceil(size / 3);
  const isVertCorner = distTop <= Math.ceil(size / 3) || distBottom <= Math.ceil(size / 3);
  let region: 'corner' | 'side' | 'center' = 'center';
  let regionName = '中腹';

  if (isHorizCorner && isVertCorner) {
    region = 'corner';
    regionName = '角部（金角）';
  } else if (distLeft === 1 || distRight === 1 || distTop === 1 || distBottom === 1 || lineNumber <= 2) {
    region = 'side';
    regionName = '边部（银边）';
  } else {
    region = 'center';
    regionName = '中腹（草肚皮）';
  }

  const centerIdx = Math.floor(size / 2);
  const isTengen = r === centerIdx && c === centerIdx;

  let isStarPoint = isTengen;
  let specialName = '';

  if (isTengen) {
    specialName = '天元 (Tengen)';
  } else {
    if (size === 19) {
      const stars = [3, 9, 15];
      if (stars.includes(r) && stars.includes(c)) {
        isStarPoint = true;
        specialName = (r === 9 || c === 9) ? '边星 (Side Star)' : '角星位 (Corner Star)';
      }
    } else if (size === 13) {
      const stars = [3, 6, 9];
      if (stars.includes(r) && stars.includes(c)) {
        isStarPoint = true;
        specialName = '星位 (Star Point)';
      }
    } else if (size === 9) {
      const stars = [2, 4, 6];
      if (stars.includes(r) && stars.includes(c)) {
        isStarPoint = true;
        specialName = '星位 (Star Point)';
      }
    } else if (size === 7) {
      const stars = [1, 3, 5];
      if (stars.includes(r) && stars.includes(c)) {
        isStarPoint = true;
        specialName = '星位 (Star Point)';
      }
    } else if (size === 5) {
      if (r === 2 && c === 2) {
        isStarPoint = true;
        specialName = '天元 (Tengen)';
      }
    }
  }

  if (!specialName) {
    const minD = Math.min(distTop, distBottom);
    const minL = Math.min(distLeft, distRight);
    const d1 = Math.min(minD, minL);
    const d2 = Math.max(minD, minL);

    if (d1 === 3 && d2 === 3) {
      specialName = '三·三 (San-San)';
    } else if (d1 === 3 && d2 === 4) {
      specialName = '小目 (Komoku)';
    } else if (d1 === 3 && d2 === 5) {
      specialName = '目外 (Mokuhazushi)';
    } else if (d1 === 4 && d2 === 5) {
      specialName = '高目 (Takamoku)';
    } else if (d1 === 5 && d2 === 5) {
      specialName = '五·五 (5-5 Point)';
    }
  }

  let fullTitle = `${coord}`;
  if (isTengen) {
    fullTitle = `🌟 ${coord} 天元 (Tengen) · 棋盘宇宙中心`;
  } else if (specialName) {
    fullTitle = `⭐ ${coord} ${specialName} · ${regionName}`;
  } else {
    fullTitle = `${coord} · ${lineName}`;
  }

  return {
    coord,
    r,
    c,
    lineNumber,
    lineName,
    lineTag,
    lineDesc,
    region,
    regionName,
    specialName,
    isStarPoint,
    isTengen,
    fullTitle
  };
}
