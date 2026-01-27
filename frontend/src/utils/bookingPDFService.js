
export const printGDSBooking = (booking) => {
    // --- 1. Helper Functions ---
    const formatFullDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            weekday: 'short', day: '2-digit', month: 'long', year: 'numeric'
        }).toUpperCase();        
    };

    const formatShortDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', {
             day: '2-digit', month: 'short'
        }).toUpperCase();
    }

    // --- 2. Data Preparation ---
    const passenger = booking.passengers && booking.passengers[0];
    const passengerName = passenger 
        ? `${passenger.surName}/${passenger.givenName} ${passenger.title || ''}`.toUpperCase() 
        : 'PASSENGER/NAME';

    const airlineName = booking.airline?.name?.toUpperCase() || 'AIRLINE';
    const flightNum = booking.flightNumber || 'XX000';
    const flightDate = formatFullDate(booking.departureDate);
    
    const origin = (booking.origin || booking.originCity || booking.flights?.[0]?.origin || '').toUpperCase() || 'ORIGIN';
    const originCode = booking.originCode || booking.flights?.[0]?.originCode || booking.originIata || 'ORG';
    const dest = (booking.destination || booking.destinationCity || booking.flights?.[0]?.destination || '').toUpperCase() || 'DESTINATION';
    const destCode = booking.destinationCode || booking.flights?.[0]?.destinationCode || booking.destinationIata || 'DES';
    
    const depTime = booking.flights?.[0]?.depTime || '00:00'; 
    const arrTime = booking.flights?.[0]?.arrTime || '00:00';
    const baggage = booking.baggageWeight || booking.flights?.[0]?.baggage || '20KG';

    const groupTypeToCountry = {
        'KSA Groups': 'SA',
        'UAE Groups': 'AE',
        'Bahrain Groups': 'BH',
        'Mascat Groups': 'OM',
        'Qatar Groups': 'QA',
        'UK Groups': 'GB',
        'Umrah Groups': 'SA'
    };
    const originCountry = booking.originCountry || 'PK';
    const destCountry = booking.destinationCountry || groupTypeToCountry[booking.groupType] || 'XX';

    // --- 3. Construct the HTML String (The GDS Design) ---
    const ticketHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Ticket</title>
            <style>
                @media print {
                    @page { margin: 0; size: auto; }
                    body { margin: 10mm; -webkit-print-color-adjust: exact; }
                }
                body {
                    font-family: 'Courier New', Courier, monospace;
                    font-weight: 600;
                    font-size: 16px;
                    color: #000;
                    line-height: 1.4;
                }
                .dashed-line {
                    border-bottom: 1px dashed #000;
                    margin: 10px 0;
                    width: 100%;
                }
                .flex-row { display: flex; justify-content: space-between; }
                .flex-start { display: flex; align-items: flex-start; }
            </style>
        </head>
        <body>
            <div style="max-width: 800px; padding: 20px;">
                
                <!-- Header -->
                <div class="flex-row" style="margin-bottom: 20px;">
                    <div>BOOKING REF: ${booking.pnr || booking.bookingReference}</div>
                    <div style="text-align: right;">${passengerName}</div>
                </div>

                <!-- Flight Line -->
                <div class="flex-row" style="align-items: flex-end; margin-bottom: 5px;">
                    <div style="display: flex; gap: 40px;">
                        <span style="width: 60px;">FLIGHT</span>
                        <span>${flightNum} - ${airlineName}</span>
                    </div>
                    <div>${flightDate}</div>
                </div>

                <!-- Dashed Separator -->
                <div class="dashed-line"></div>

                <!-- Itinerary Grid -->
                <div class="flex-start" style="margin-bottom: 5px;">
                    <!-- Labels -->
                    <div style="width: 100px; display: flex; flex-direction: column; gap: 5px;">
                        <div>DEPARTURE:</div>
                        <div>ARRIVAL:</div>
                    </div>

                    <!-- Middle Details -->
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">
                        <div>${origin}, ${originCountry} (${originCode})</div>
                        <div>${dest}, ${destCountry} (${destCode})</div>
                        
                        <div style="margin-top: 10px;">FLIGHT BOOKING REF: ${booking.airlinePnr || booking.pnr || 'N/A'}</div>
                        <div>RESERVATION CONFIRMED, ECONOMY (Y)</div>
                    </div>

                    <!-- Right Side Times -->
                    <div style="width: 150px; text-align: right; display: flex; flex-direction: column; gap: 5px;">
                        <div>${formatShortDate(booking.departureDate)} ${depTime}</div>
                        <div>${formatShortDate(booking.arrivalDate || booking.departureDate)} ${arrTime}</div>
                        <div style="margin-top: 20px;">DURATION: 04:45</div>
                    </div>
                </div>

                <!-- Dashed Separator -->
                <div class="dashed-line"></div>

                <!-- Baggage & Meal -->
                <div class="flex-start" style="margin-bottom: 5px;">
                    <div style="width: 100px;"></div>
                    <div style="flex: 1;">
                        <div style="display: flex; gap: 20px;">
                            <span style="width: 150px;">BAGGAGE ALLOWANCE:</span>
                            <span>${baggage}</span>
                        </div>
                    </div>
                </div>
                 <div class="flex-start">
                    <div style="width: 100px;"></div>
                    <div style="flex: 1;">
                        <div style="display: flex; gap: 20px;">
                            <span style="width: 150px;">MEAL:</span>
                            <span>MEAL</span>
                        </div>
                    </div>
                </div>

                <!-- Route Info -->
                <div style="margin-top: 15px; display: flex;">
                    <div style="width: 100px;">NON STOP</div>
                    <div style="flex: 1;">
                        <div>${origin} TO ${dest}</div>
                        <div style="display: flex; margin-top: 5px;">
                            <span style="width: 150px;">EQUIPMENT:</span>
                            <span>BOEING 777-300</span>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="margin-top: 40px; border-top: 1px dashed #000; padding-top: 10px;">
                     <div>FLIGHT(S) CALCULATED AVERAGE CO2 EMISSIONS IS 210.57 KG/PERSON</div>
                     <div>SOURCE: ICAO CARBON EMISSIONS CALCULATOR</div>
                </div>

                <div style="margin-top: 30px;">
                    FLIGHT TICKET(S)
                    <div class="dashed-line" style="margin-top: 5px;"></div>
                </div>
                
                <div style="margin-top: 20px; font-size: 11px; text-align: center;">
                    GENERATED BY SYSTEM | ${new Date().toLocaleString()}
                </div>
                
                <!-- Terms and Conditions -->
                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px dashed #000;">
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">TERMS & CONDITIONS</div>
                    <div style="font-size: 12px; line-height: 1.6;">
                        <div style="margin-bottom: 8px;">1- PASSENGER SHOULD REPORT AT CHECK-IN COUNTER AT LEAST 04:00 HOURS PRIOR TO FLIGHT.</div>
                        <div>2- TICKETS ARE NON-REFUNDABLE AND NON-CHANGEABLE ANY TIME.</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    // --- 4. The Iframe Trick (Fixes "Dashboard Printing" issue) ---
    
    // Create an invisible iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    
    document.body.appendChild(iframe);

    // Get the iframe's document
    const doc = iframe.contentWindow.document;

    // Write the content
    doc.open();
    doc.write(ticketHTML);
    doc.close();

    // Wait for content to load, then print
    iframe.onload = () => {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (e) {
            console.error("Print failed", e);
        } finally {
            // Remove iframe after a short delay to ensure print dialog opened
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }
    };
};