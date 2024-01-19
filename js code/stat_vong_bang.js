document.addEventListener('DOMContentLoaded', async function() {
    try {
        const fetchAndCreateTableRows = async (fullURL, startIndex, targetID) => {
            const res = await fetch(fullURL);
            if (!res.ok) {
                throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
            }
            const rep = await res.text();
            const data = JSON.parse(rep.substr(47).slice(0, -2));
            const dataBody = document.getElementById(targetID);
            
            for (let i = startIndex; i < startIndex + 5; i++) {
                const rowData = data.table.rows[i].c;
                const row = document.createElement('tr');
                let agent = document.createElement('img');
                agent.classList.add('agent-pick');
                agent.src = 'agent/'+rowData[0].v+'.png';
                let hs = document.createElement('td');
                hs.textContent = rowData[6].v + ' %';
                
                row.appendChild(agent);
                for (let j = 1; j < rowData.length-1; j++) {
                    const cell = document.createElement('td');
                    cell.textContent = rowData[j].v;
                    row.appendChild(cell);
                }
                row.appendChild(hs);
                dataBody.appendChild(row);
            }
        };

        const sheets = [
            { title: 'Bảng A', range: 'B2:H31', targetLeft: 'team-left-A-', targetRight: 'team-right-A-' },
            { title: 'Bảng B', range: 'B2:H31', targetLeft: 'team-left-B-', targetRight: 'team-right-B-' },
            { title: 'Bảng C', range: 'B2:H31', targetLeft: 'team-left-C-', targetRight: 'team-right-C-' },
            // ... (other groups)
        ];

        const SHEET_ID = '1QggU0zafsVUpV7f-YDYHg5jAfxKAMWZgk57JZSvCVuU';
        const fetchPromises = sheets.map(async (sheet) => {
            const fullURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${sheet.title}&range=${sheet.range}`;
            
            const res = await fetch(fullURL);
            if (!res.ok) {
                console.error(`Failed to fetch ${sheet.title} data: ${res.status} ${res.statusText}`);
                return; // Move to the next sheet in case of a fetch failure
            }

            const rep = await res.text();
            const data = JSON.parse(rep.substr(47).slice(0, -2));
            
            const leftPromises = [];
            const rightPromises = [];
            for (let i = 0; i < 3; i++) {
                leftPromises.push(fetchAndCreateTableRows(fullURL, i * 10, `${sheet.targetLeft}${i + 1}`));
                rightPromises.push(fetchAndCreateTableRows(fullURL, (i * 10) + 5, `${sheet.targetRight}${i + 1}`));
            }

            await Promise.all([...leftPromises, ...rightPromises]);
        });

        await Promise.all(fetchPromises);
    } catch (error) {
        console.error('Error occurred:', error);
    }
});
