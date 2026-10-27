/* Tutorial content for every open-source tool on risarezaei.github.io.
   The code itself is loaded live from GitHub; each step starts at the first
   line (after the previous step) that contains its `at` text. */
window.TOOLS = [
{
  id: 'gee-gsw-lake-explorer',
  title: 'GSW Lake Explorer: Any Lake on Earth, 1984–2021',
  kicker: 'Earth Engine · Live app',
  cat: ['water'],
  lang: 'js',
  app: 'https://risarezaei.projects.earthengine.app/view/gsw-lake-explorer',
  short: 'A public Earth Engine app: click any lake on Earth and watch its JRC Global Surface Water history, with a yearly area chart, a decade comparison and a shareable link. No sign-up.',
  tags: ['Earth Engine App', 'JRC Global Surface Water', 'HydroLAKES'],
  highlights: [['1.4 M', 'lakes, one click away'], ['1984–2021', 'yearly water classes'], ['−56.5 %', 'Lake Urmia permanent water'], ['0', 'getInfo() calls']],
  caption: 'Lake Urmia in 1998, 2008, 2015 and 2021: permanent water (dark blue), seasonal water (light blue), land (beige) and the HydroLAKES shoreline (red).',
  gif: 'docs/timelapse.gif',
  problem: 'The JRC Global Surface Water record is one of the best descriptions of how lakes changed since 1984, but looking at a single lake still means writing code, drawing a polygon and waiting for exports. Many early years also have gaps in the Landsat record, which quietly turn into “lost water” in naive area series.',
  approach: [
    'Find the lake the user clicks (or searches by name) in HydroLAKES, so nobody has to draw a boundary.',
    'Set the analysis scale and buffer from the lake area, so a pond and the Caspian Sea both stay within about a million pixels per year.',
    'Sum permanent, seasonal and unobserved area per year with <code>pixelArea()</code>, and keep only years where less than 5 % of the lake was unobserved for the chart and summary.',
    'Render one labelled PNG per fully observed year and play them in the panel, instead of an animated GIF (which Earth Engine pads with a black band once it has more than a few frames).',
    'Write the lake ID into the page URL, so every view can be shared as a link.'
  ],
  skills: ['Earth Engine Apps (ui.*)', 'Asynchronous evaluate() design', 'Zonal statistics', 'Data-gap handling', 'Adaptive scale', 'Web-map UX', 'Science communication'],
  data: [['JRC Global Surface Water 1.4 (yearly)', 'https://developers.google.com/earth-engine/datasets/catalog/JRC_GSW1_4_YearlyHistory'], ['HydroLAKES v1.0', 'https://www.hydrosheds.org/products/hydrolakes']],
  outputs: ['Public app with a shareable link per lake', 'Animated yearly water map', 'Yearly area chart (km²)', 'Decade-to-decade change in permanent and total water'],
  files: [{ path: 'gsw_lake_explorer.js', steps: [
    { t: 'Data and colours', d: 'Three datasets carry the whole app: HydroLAKES polygons, the GSW summary image (occurrence, transitions) and the GSW <code>YearlyHistory</code> collection, whose <code>waterClass</code> band is 0 = no observation, 1 = land, 2 = seasonal water, 3 = permanent water. The public <code>users/gena/packages:text</code> module draws the year on each frame.' },
    { at: '// ---------------------------------------------------------------- map', t: 'Base map', d: 'Water occurrence is shown from the start, so the map already invites a click. Transitions and a single-year layer (driven by the slider) are there for anyone who wants to look closer.' },
    { at: '// ---------------------------------------------------------------- panel', t: 'The side panel', d: 'Every result widget is created once and only refilled later. That keeps the layout stable while results arrive one by one.' },
    { at: 'function showLake(hits)', t: 'Finding the lake without blocking the page', d: 'Clicks and searches both end up here. Only the lake’s properties travel to the browser, never its geometry, so even the Caspian Sea answers fast. A <code>requestId</code> counter drops callbacks from an older click if the user clicks again before results arrive.' },
    { at: '// scale & buffer adapt', t: 'A scale that fits every lake', d: 'Analysis scale = max(30 m, 2·√area) and buffer = 50·√area keep every request around a million pixels: 30 m for a small reservoir, about 140 m for Lake Urmia and about 1.2 km for the Caspian. The scale is shown in the panel, so users know what they are looking at.' },
    { at: '// ---- yearly areas', t: 'Yearly areas and honest data gaps', d: 'For every year the script sums the area of permanent water, seasonal water and <em>unobserved</em> pixels. Years where more than 5 % of the lake was unobserved are dropped from the chart and summary: otherwise the gappy 1980s and 1990s look like years of “lost” water.' },
    { at: '// ---- animation:', t: 'An animation without gaps or black bands', d: 'Only years with less than 1 % unobserved area are animated. Each year becomes its own labelled PNG on a white, padded frame, so the shoreline is never cut. The panel then shows one <code>ui.Thumbnail</code> at a time with <code>ui.util.setTimeout</code>. An animated GIF would be simpler, but Earth Engine adds a black band at the bottom of GIFs with more than about three frames.' },
    { at: 'var chart = ui.Chart', t: 'Chart and decade summary', d: 'The chart plots permanent, seasonal and total water for the reliable years. The summary compares the first and last decade: for Lake Urmia, permanent water fell from 4,881 to 2,122 km² (−56.5 %) while total water fell only 23.9 %, because much of the old lake bed now floods seasonally.' },
    { at: '// ---------------------------------------------------------------- events', t: 'Click, search and share', d: 'A map click, a name search and a shared URL (<code>#lake=142</code>) all call the same <code>showLake()</code>. Search uses <code>stringContains</code> and picks the largest matching lake.' }
  ]}]
},
{
  id: 'gee-wetland-water-rf',
  title: 'Wetland Water Mapping with Random Forest',
  kicker: 'Earth Engine · Machine learning',
  cat: ['water', 'ml'],
  lang: 'js',
  short: 'Landsat 5–9 open-water classification on eight spectral water indices, with hold-out accuracy, variable importance and a water-area series since 1984.',
  tags: ['Random Forest', 'Landsat 5–9', 'Accuracy assessment'],
  highlights: [['98.7 %', 'hold-out accuracy'], ['0.974', 'kappa'], ['8', 'water indices'], ['1985–2025', 'area series']],
  caption: 'Lake Urmia, summer composites: the same trained model applied to 1995 and 2025, the open-water series, the confusion matrix and variable importance.',
  problem: 'Single-index thresholds (NDWI > 0, MNDWI > 0) break down in shallow, turbid or salt-crusted wetlands, where bright salt flats and wet soil look like water in one index but not in others. Monitoring needs a classifier that is checked against independent data and can be re-applied to every year of the Landsat archive.',
  approach: [
    'Harmonise Landsat 5, 7, 8 and 9 Collection 2 surface reflectance to one set of band names, with QA-based cloud, shadow and saturation masks.',
    'Build a seasonal median composite and compute eight water indices (NDVI, NDWI, MNDWI, AWEI<sub>nsh</sub>, AWEI<sub>sh</sub>, WRI, NWI, EWI).',
    'Draw stratified training samples automatically from the JRC Global Surface Water yearly history (or from drawn polygons).',
    'Train a 100-tree Random Forest on 70 % of the samples and validate on the other 30 %: confusion matrix, overall accuracy, kappa, producer’s and user’s accuracy.',
    'Apply the trained model to every year in a list and turn each map into an area in km² for a 40-year series.'
  ],
  skills: ['Landsat Collection 2 pre-processing', 'Multi-sensor harmonisation', 'Spectral index engineering', 'Supervised classification', 'Stratified sampling', 'Accuracy assessment', 'Variable importance', 'Time-series of maps', 'Batch exports'],
  data: [['Landsat 5/7/8/9 C2 L2', 'https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LC08_C02_T1_L2'], ['JRC Global Surface Water 1.4', 'https://developers.google.com/earth-engine/datasets/catalog/JRC_GSW1_4_YearlyHistory']],
  outputs: ['Water map of the target year (GeoTIFF)', 'Accuracy table with variable importance (CSV)', 'Water-area series in km² (CSV + chart)'],
  files: [{ path: 'wetland_water_rf.js', steps: [
    { t: 'Header and settings', d: 'Every script starts with one <code>CONFIG</code> block, so a user changes the study area, years, season, training source and number of trees in one place and never has to touch the logic. <code>trainingSource: \'auto\'</code> means the script runs anywhere without drawing a single point.' },
    { at: 'var roi = CONFIG.roi', t: 'Cloud-free reflectance from four Landsat sensors', d: 'Landsat 5/7 and 8/9 store the same colours under different band numbers, so <code>prepare()</code> renames them to <code>blue … swir2</code>. It reads the <code>QA_PIXEL</code> bit flags (dilated cloud, cloud, shadow) and the saturation band, applies the Collection 2 scale factors (×0.0000275 − 0.2) and keeps the acquisition date. Filtering by place, date and cloud cover happens <em>before</em> <code>map()</code>, which keeps the job small.' },
    { at: '// ---- Spectral water indices', t: 'Eight water indices as features', d: 'Each index separates water from a different confuser: MNDWI from built-up land, AWEI<sub>sh</sub> from shadows, NDVI from vegetation, and WRI/EWI from bright soil and salt. Giving the classifier all eight lets it learn which combination works for this lake. <code>median()</code> returns a fully masked placeholder when a year has no clear scenes, so the series never crashes on a gap year.' },
    { at: '// ---- Training samples', t: 'Training data without drawing points', d: 'The JRC yearly history labels every 30 m pixel as not water (1), seasonal (2) or permanent water (3). Seasonal pixels are ambiguous, so they are masked out and <code>stratifiedSample()</code> draws the same number of points from land and permanent water. A random column then splits the samples 70/30 into training and validation sets.' },
    { at: 'var classifier = ee.Classifier', t: 'Train the Random Forest', d: '<code>smileRandomForest</code> with 100 trees and a fixed seed, so results are reproducible. Only the eight index bands are used as inputs.' },
    { at: '// ---- Accuracy assessment', t: 'Hold-out accuracy and variable importance', d: 'The validation points were never seen during training. <code>errorMatrix()</code> gives the confusion matrix, from which overall accuracy, kappa, producer’s accuracy (omission) and user’s accuracy (commission) follow. <code>classifier.explain()</code> returns how much each index contributed, which is charted in the Console. For Lake Urmia: 98.7 % accuracy, kappa 0.974.' },
    { at: '// ---- Classification of the target year', t: 'Classify and measure area', d: '<code>ee.Image.pixelArea()</code> gives the true area of every pixel in m², so masking it with the water class and summing gives km² independent of projection. The map, the composite and the training points are added as layers for a visual check.' },
    { at: '// ---- Water-area time series', t: 'One model, forty years', d: 'The trained model is applied to the composite of each year in <code>seriesYears</code>. The result is a FeatureCollection with the year, the water area and the number of scenes used, charted as a line and ready for export.' },
    { at: '// ---- Exports', t: 'Exports', d: 'The water map goes to Drive as a GeoTIFF, and accuracy metrics plus importance and the area series go out as CSV tables. Exports run as batch tasks, so they are not limited by the interactive time-out.' }
  ]}]
},
{
  id: 'gee-air-quality-toolkit',
  title: 'Air-Quality Toolkit',
  kicker: 'Earth Engine · Atmosphere',
  cat: ['air'],
  lang: 'js',
  short: 'Monthly NO₂, SO₂, CO, O₃, HCHO (Sentinel-5P) and aerosol optical depth (MODIS) for a region and its stations, in one tidy CSV.',
  tags: ['Sentinel-5P', 'MODIS MAIAC AOD', 'Air quality'],
  highlights: [['6', 'pollutants in one run'], ['2019–2025', 'monthly record'], ['979', 'December NO₂ peak (µmol/m²)'], ['1', 'tidy long-format CSV']],
  caption: 'Tehran region, 2019–2025: mean NO₂ map, the six monthly series and the NO₂ seasonal cycle (winter peaks about four times the spring minimum).',
  problem: 'Ground stations are sparse and often have gaps, while satellite air-quality products come as separate collections with different bands, units and scale factors. Analysts usually write one script per pollutant and then merge spreadsheets by hand.',
  approach: [
    'Describe every product once in a <code>PRODUCTS</code> table: dataset ID, band, unit conversion, scale and display range.',
    'Build one monthly mean image per pollutant, with an explicit masked image for months without data.',
    'Reduce each monthly image over the region and over buffers around each station in one <code>reduceRegions</code> call.',
    'Flatten everything into a long table (pollutant, unit, site, month, value, number of images) and chart one series per site.'
  ],
  skills: ['Data-driven script design', 'Sentinel-5P TROPOMI', 'MODIS MAIAC aerosols', 'Unit handling', 'Monthly compositing', 'Zonal statistics', 'Tidy data', 'Multi-series charts'],
  data: [['Sentinel-5P OFFL L3 (NO₂, SO₂, CO, O₃, HCHO)', 'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S5P_OFFL_L3_NO2'], ['MODIS MCD19A2 MAIAC AOD', 'https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MCD19A2_GRANULES']],
  outputs: ['One chart per pollutant (region + stations)', 'Period-mean map for each pollutant', 'Long-format CSV for all pollutants, sites and months', 'Optional monthly GeoTIFFs'],
  files: [{ path: 'air_quality_toolkit.js', steps: [
    { t: 'Header and settings', d: 'Region, stations (name, lon, lat), buffer radius, period and the list of pollutants. Removing a pollutant from the list removes it from the charts, maps and table.' },
    { at: 'var PRODUCTS = {', t: 'One table describes every product', d: 'Instead of six copies of the same code, each product is a row: collection ID, band, a factor to readable units (mol/m² → µmol/m², or the 0.001 AOD scale), the native scale for reductions and a display range. Adding a new pollutant is one line.' },
    { at: 'var region = CONFIG.region', t: 'Months and sites', d: 'The list of month starts is built on the server with <code>ee.List.sequence</code>. Stations become 2 km buffers, and the region itself is added as one more “site”, so the regional mean and the station means come out of the same reduction.' },
    { at: 'function collection(key)', t: 'Monthly means that never break', d: '<code>collection()</code> filters by region and date first, selects the band and converts units. <code>monthly()</code> averages each month; if a month has no images it returns a fully masked image instead of failing, and stores the image count so data gaps stay visible in the output.' },
    { at: '// Long-format table', t: 'A tidy table', d: 'One <code>reduceRegions</code> per month computes the mean at every site at once. Geometry is dropped and each row is labelled with pollutant, unit, month and image count. <code>flatten()</code> turns the collection of collections into one long table, which is what pandas, R or Excel pivot tables expect.' },
    { at: 'Map.centerObject(region, 10)', t: 'Charts and maps for every pollutant', d: 'A client-side loop over the chosen pollutants adds a period-mean map layer and a grouped line chart (one line per site), and merges each table into one collection. Optional monthly GeoTIFF exports use a month list built on the client, so no <code>getInfo()</code> round trip is needed.' },
    { at: "Map.addLayer(ee.Image().paint(region", t: 'Export', d: 'The merged table is exported once, with fixed column order, as <code>air_quality_monthly.csv</code>.' }
  ]}]
},
{
  id: 'gee-lake-chlorophyll',
  title: 'Lake Chlorophyll-a Monitor',
  kicker: 'Earth Engine · Water quality',
  cat: ['water'],
  lang: 'js',
  short: 'Sentinel-2 NDCI chlorophyll-a for lakes and reservoirs with Cloud Score+ masking, monthly lake statistics and a MODIS-Aqua comparison.',
  tags: ['Sentinel-2', 'Cloud Score+', 'Algal blooms'],
  highlights: [['20 m', 'Sentinel-2 detail'], ['NDCI', 'Mishra & Mishra 2012'], ['p90', 'bloom hot-spot metric'], ['2', 'sensors compared']],
  caption: 'Western Lake Erie: mean Chl-a for July–September 2025 (bloom in the south-west corner) and monthly Sentinel-2 median, 90th percentile and MODIS-Aqua values.',
  problem: 'Harmful algal blooms change within weeks, and lake sampling campaigns cover only a few points. Ocean-colour products are too coarse for most lakes, and Sentinel-2 needs careful cloud and land masking before any water-quality index can be trusted.',
  approach: [
    'Mask clouds with Cloud Score+ (per time window, which is much faster than linking the whole archive at once) and ice with the scene classification.',
    'Keep only permanent water from the JRC occurrence layer so shorelines and flooded fields cannot bias the statistics.',
    'Compute NDCI = (B5 − B4)/(B5 + B4) and convert it to chlorophyll-a with a published polynomial.',
    'Summarise each month with the median, the 90th percentile and the clear-water area, and add the MODIS-Aqua monthly mean as a check.'
  ],
  skills: ['Sentinel-2 L2A', 'Cloud Score+ masking', 'Water-quality remote sensing', 'Empirical algorithms', 'Robust statistics', 'Sensor inter-comparison', 'Performance tuning'],
  data: [['Sentinel-2 SR Harmonized', 'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED'], ['Cloud Score+ S2', 'https://developers.google.com/earth-engine/datasets/catalog/GOOGLE_CLOUD_SCORE_PLUS_V1_S2_HARMONIZED'], ['MODIS-Aqua L3SMI', 'https://developers.google.com/earth-engine/datasets/catalog/NASA_OCEANDATA_MODIS-Aqua_L3SMI'], ['JRC Global Surface Water', 'https://developers.google.com/earth-engine/datasets/catalog/JRC_GSW1_4_GlobalSurfaceWater']],
  outputs: ['Monthly Chl-a chart (median, p90, MODIS)', 'Seasonal mean Chl-a map', 'CSV: month, images, clear km², Chl-a statistics', 'Optional GeoTIFF'],
  files: [{ path: 'lake_chlorophyll.js', steps: [
    { t: 'Header and settings', d: 'The header documents the algorithm and its limits: the NDCI polynomial was fitted for turbid, productive water, so values in clear lakes are a relative bloom index unless the coefficients are recalibrated. All choices (months, cloud threshold, water-mask threshold, coefficients) live in <code>CONFIG</code>.' },
    { at: 'var lake = CONFIG.lake', t: 'A permanent-water mask', d: 'Pixels that were water in at least 80 % of JRC observations form the mask. Mixed shoreline pixels and seasonally flooded land are excluded, which removes the most common source of false “blooms”.' },
    { at: '// ---- Sentinel-2 surface reflectance', t: 'Cloud Score+ and NDCI', d: '<code>linkCollection</code> attaches the Cloud Score+ <code>cs_cdf</code> band to each Sentinel-2 image; pixels below 0.65 are cloud or haze. Doing this inside <code>s2(from, to)</code> for one month at a time keeps the join small. NDCI uses the red-edge band B5, which rises with chlorophyll, against red B4; the polynomial turns it into mg/m³.' },
    { at: '// ---- MODIS-Aqua chlorophyll', t: 'An independent check', d: 'The MODIS-Aqua monthly chlorophyll product (4.6 km) is filtered to the same period. It reads low in turbid inland water, but its timing should match the Sentinel-2 peaks.' },
    { at: '// ---- Monthly statistics', t: 'Monthly lake statistics in one pass', d: 'The month list is built in plain JavaScript and filtered to the bloom season. For each month a combined reducer returns the median, the 90th percentile and the pixel count in a single <code>reduceRegion</code>; the count is converted to clear-water km². The 90th percentile captures hot spots that a lake-wide mean would hide.' },
    { at: '// Months with very little clear water', t: 'Quality filter and chart', d: 'Months with less than 50 km² of clear water give unreliable medians and are left out of the chart (they stay in the CSV). The chart overlays the median, the 90th percentile and MODIS.' },
    { at: '// ---- Seasonal map', t: 'Seasonal bloom map', d: 'Mean Chl-a for a chosen season, drawn with a blue-to-red palette. In the example the bloom in Maumee Bay stands out clearly against the open lake.' },
    { at: '// ---- Exports', t: 'Exports', d: 'The monthly table goes to Drive as CSV. Because exports run as batch tasks, they also handle long records that would time out interactively.' }
  ]}]
},
{
  id: 'gee-basin-hydroclimate',
  title: 'Basin Hydroclimate Time Series',
  kicker: 'Earth Engine · Hydrology',
  cat: ['water', 'climate'],
  lang: 'js',
  short: 'Monthly precipitation, evaporation, MODIS ET, temperature and GRACE water storage averaged over any river basin, as one table.',
  tags: ['ERA5-Land', 'GRACE / GRACE-FO', 'Water balance'],
  highlights: [['6', 'variables per month'], ['4', 'satellite & reanalysis products'], ['52,199 km²', 'example basin'], ['2003–2024', 'monthly record']],
  caption: 'Lake Urmia basin (HydroBASINS level 4): precipitation vs. MODIS ET, the GRACE storage anomaly (a clear long-term decline) and air vs. land-surface temperature.',
  problem: 'A basin water balance needs precipitation, evapotranspiration, temperature and storage from different sources with different units, time steps and grids. Collecting them by hand for every basin is slow and error-prone.',
  approach: [
    'Pick basins by clicking a point (HydroBASINS polygon at any level) or bring your own polygons.',
    'For each month, build one six-band image from ERA5-Land, MODIS MOD16 ET, MODIS MOD11 LST and GRACE mascons, converting every variable to mm or °C.',
    'Fill months where a product has no data with a masked band, so every month has the same bands.',
    'Average all bands over every basin in one <code>reduceRegions</code> per month and export a tidy table.'
  ],
  skills: ['Water-balance components', 'ERA5-Land reanalysis', 'MODIS ET & LST', 'GRACE gravimetry', 'Unit conversion', 'HydroBASINS', 'Zonal statistics', 'Tidy exports'],
  data: [['ERA5-Land monthly', 'https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_MONTHLY_AGGR'], ['MODIS MOD16A2GF ET', 'https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD16A2GF'], ['MODIS MOD11A2 LST', 'https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD11A2'], ['GRACE/GRACE-FO JPL mascons', 'https://developers.google.com/earth-engine/datasets/catalog/NASA_GRACE_MASS_GRIDS_V04_MASCON'], ['HydroBASINS', 'https://developers.google.com/earth-engine/datasets/catalog/WWF_HydroSHEDS_v1_Basins_hybas_4']],
  outputs: ['Three charts per basin', 'CSV: basin, month, precip, evap, ET, T2m, LST, TWS'],
  files: [{ path: 'basin_hydroclimate.js', steps: [
    { t: 'Header and settings', d: 'The header lists every output column with its source and unit. Basins are given as a name and a point; <code>hydrobasinsLevel</code> chooses how large the basin is (level 4 ≈ large river basins).' },
    { at: '// ---- Basins', t: 'Basins from a click', d: 'For each point, <code>filterBounds</code> finds the HydroBASINS polygon that contains it. The ID and area are kept and the user’s name is attached. Custom polygons with a <code>name</code> property work too.' },
    { at: '// ---- Datasets', t: 'Four data sources', d: 'The collections are filtered once, up front, to the basins’ bounding box.' },
    { at: '// Returns a 1-band image', t: 'Always the same bands', d: '<code>orEmpty()</code> returns the computed band when data exist and a masked band otherwise (GRACE has a gap in 2017–2018). Every month therefore has identical bands, which keeps the table rectangular.' },
    { at: 'function month(m0)', t: 'Unit conversions', d: 'ERA5 precipitation is in metres (×1000 → mm); evaporation is negative by convention (×−1000). MOD16 ET is an 8-day sum with scale 0.1, so it becomes a daily rate × days in the month. LST has scale 0.02 K. GRACE is already equivalent water height in cm.' },
    { at: "var BANDS = ['precip_mm'", t: 'Basin means for every month', d: 'For each month the six-band image is averaged over each basin at 5 km, enough for basin means because GRACE mascons are much coarser. The result is one row per basin and month.' },
    { at: '// ---- Charts for each basin', t: 'Charts and export', d: 'Three charts per basin: precipitation vs. evapotranspiration, the GRACE storage anomaly and temperature. The table is exported with a fixed column order.' }
  ]}]
},
{
  id: 'gee-landsat-timelapse',
  title: 'Landsat Timelapse for Lakes and Wetlands',
  kicker: 'Earth Engine · Visualisation',
  cat: ['water'],
  lang: 'js',
  short: 'Forty years of cloud-free summer composites turned into an animated GIF, with the shoreline traced on every frame.',
  tags: ['Landsat', 'Animation', 'Shoreline change'],
  highlights: [['40', 'frames, 1985–2025'], ['MNDWI', 'shoreline on every frame'], ['GIF / MP4', 'outputs'], ['WRS-aware', 'scene selection']],
  caption: 'Lake Urmia every ten years from 1985 to 2025, natural colour with the water edge in cyan.',
  gif: 'docs/timelapse.gif',
  problem: 'Change in lakes and wetlands is most convincing when people can see it. Building a clean timelapse is harder than it looks: clouds, Landsat 7 stripes, missing years, and large areas that span two satellite paths all produce broken frames or memory errors.',
  approach: [
    'Merge Landsat 5, 8 and 9 (7 optional), mask clouds and scale reflectance.',
    'Per year, keep only the clearest scenes of each WRS path, so areas that span two paths stay complete while each frame stays light.',
    'Build a median composite per year and draw the MNDWI > 0 water edge on top.',
    'Drop years without data and render the frames as a GIF (and optionally an MP4).'
  ],
  skills: ['Landsat archive handling', 'Scene selection', 'Memory-aware Earth Engine', 'Image visualisation', 'Edge detection', 'Science communication'],
  data: [['Landsat 5/8/9 C2 L2', 'https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LT05_C02_T1_L2']],
  outputs: ['Animated GIF link in the Console', 'Optional MP4 export to Drive', 'Last frame as a map layer'],
  files: [{ path: 'landsat_timelapse.js', steps: [
    { t: 'Header and settings', d: 'Area, years, season, cloud limits, colour mode, outline colour, size and speed of the animation.' },
    { at: 'var roi = CONFIG.roi', t: 'Shared band names and cloud mask', d: 'The same <code>prepare()</code> pattern as the other Landsat tools, but it also copies <code>WRS_PATH</code> and <code>CLOUD_COVER</code> so scenes can be selected later.' },
    { at: 'function landsat(year)', t: 'The clearest scenes of every path', d: 'Limiting to the N clearest scenes overall would drop one path for areas that span two. Instead, the script collects the IDs of the clearest scenes <em>per WRS path</em> and filters with <code>ee.Filter.inList</code>. This fixed “memory limit exceeded” errors without losing half of the lake.' },
    { at: 'var VIS = CONFIG.display', t: 'Frames with a shoreline', d: 'Each year becomes a median composite turned into RGB with <code>visualize()</code>. The water edge is where a 1-pixel max filter and min filter of the MNDWI > 0 mask disagree, blended on top in cyan. Years without scenes get a masked placeholder.' },
    { at: 'var years = [];', t: 'Animate and export', d: 'Frames without scenes are filtered out, and <code>getVideoThumbURL</code> returns a GIF link asynchronously (no blocking <code>getInfo()</code>). <code>Export.video.toDrive</code> writes a high-resolution MP4.' }
  ]}]
},
{
  id: 'gee-water-resources-course',
  title: 'Earth Engine for Water Resources: a Short Course',
  kicker: 'Earth Engine · Teaching',
  cat: ['teaching', 'water', 'ml'],
  lang: 'js',
  short: 'Six commented lessons for students: water frequency, multi-temporal water maps, soil-moisture downscaling and rainfall trend tests.',
  tags: ['Course', 'Hydrology', 'Random Forest regression'],
  highlights: [['6', 'lessons'], ['0.75', 'R² in lesson 4 (test set)'], ['8', 'datasets used'], ['0', 'getInfo() calls']],
  caption: 'Outputs of lessons 2, 3 and 6: water frequency of Gorgan Bay, the last epoch with water at Lake Urmia, and Sen’s slope of annual rainfall in Iran.',
  problem: 'Hydrology students often learn Earth Engine from generic examples that do not answer water questions. This course goes from loading an image to a machine-learning downscaling model and statistical trend tests, always on a real water problem.',
  approach: [
    'Lesson 1: filter collections, mask clouds, build and export a composite.',
    'Lesson 2: map a function over 25 years of MODIS and turn binary water maps into a frequency map.',
    'Lesson 3: harmonise four Landsat sensors and map when each pixel was last water.',
    'Lesson 4: downscale 9 km SMAP soil moisture to 1 km with Random Forest regression.',
    'Lesson 5: build a water-area time series and fit a linear trend.',
    'Lesson 6: map Sen’s slope and Mann-Kendall significance of annual rainfall.'
  ],
  skills: ['Teaching & documentation', 'MODIS, Landsat, SMAP, Sentinel-1, CHIRPS', 'Water indices', 'Random Forest regression', 'Model validation (R², RMSE)', 'Non-parametric trend tests', 'Time series'],
  data: [['Landsat 5/7/8/9', 'https://developers.google.com/earth-engine/datasets/catalog/landsat'], ['MODIS MOD09A1', 'https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD09A1'], ['SMAP SPL3SMP_E', 'https://developers.google.com/earth-engine/datasets/catalog/NASA_SMAP_SPL3SMP_E_006'], ['Sentinel-1 GRD', 'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S1_GRD'], ['CHIRPS pentad', 'https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_PENTAD']],
  outputs: ['Six runnable scripts, each ending with an exercise'],
  files: [
  { path: '01_data_import.js', label: 'Lesson 1 · Data import', steps: [
    { t: 'What the lesson covers', d: 'Each lesson opens with its goal and the concepts it teaches, so it works as a handout.' },
    { at: '// 1. Study area', t: 'A basin as the study area', d: 'HydroBASINS level 4 gives large river basins worldwide. <code>filterBounds</code> with one point picks the basin that contains it.' },
    { at: '// 2. Cloud mask', t: 'Cloud mask and scale factors', d: 'Bits 3 and 4 of <code>QA_PIXEL</code> flag clouds and shadows. Collection 2 surface reflectance is stored as integers and needs ×0.0000275 − 0.2.' },
    { at: '// 3. Filter by place', t: 'Filter first, then map', d: 'Place, date range and a January–June season filter (<code>calendarRange</code>) shrink the collection before the cloud mask is mapped over it. The median of the remaining scenes is the composite.' },
    { at: '// 4. False colour', t: 'Display', d: 'SWIR1–NIR–red false colour: vegetation is green, water is dark blue.' },
    { at: '// 5. Export', t: 'Export without getInfo()', d: 'The CRS is given as a string, so nothing has to be pulled from the server to the browser.' }
  ]},
  { path: '02_water_frequency.js', label: 'Lesson 2 · Water frequency', steps: [
    { t: 'Goal', d: 'How often is each pixel covered by water? 25 years of MODIS 8-day reflectance over a coastal lagoon.' },
    { at: '// Study area', t: 'Study area', d: 'A rectangle around Gorgan Bay and the Miankaleh peninsula on the south-east Caspian coast.' },
    { at: '// NDWI (McFeeters)', t: 'A function mapped over a collection', d: '<code>ndwi()</code> masks cloudy pixels with the <code>StateQA</code> bits and computes NDWI from MODIS green and NIR. <code>map()</code> applies it to every image.' },
    { at: '// Water where NDWI', t: 'Threshold to water / not water', d: 'Each image becomes a binary map. The threshold (0.1) is a parameter worth testing.' },
    { at: '// Frequency =', t: 'From binary maps to frequency', d: '<code>sum()</code> counts water observations and <code>count()</code> counts clear observations; their ratio × 100 is the water frequency.' }
  ]},
  { path: '03_multitemporal_water.js', label: 'Lesson 3 · Multi-temporal water', steps: [
    { t: 'Goal', d: 'One map that shows when each pixel was last covered by water: 1985–99, 2000–12 or 2013–24.' },
    { at: '// Same band names', t: 'Harmonising Landsat sensors', d: 'Landsat 5/7 and 8/9 use different band numbers for the same colours. Renaming them lets one collection hold all four sensors. Keeping <code>system:time_start</code> is essential, or later date filters silently fail.' },
    { at: '// Filter first', t: 'Late-summer scenes', d: 'Only July–September scenes are used, when the lake is at its seasonal low.' },
    { at: '// Water in an epoch', t: 'Epoch water maps', d: 'Median MNDWI > 0 for each epoch.' },
    { at: '// 0 = never water', t: 'Class map with where()', d: '<code>where()</code> overwrites in order, so the latest epoch with water wins.' },
    { at: '// Area of each class', t: 'Area per class', d: 'A grouped reducer sums pixel area per class in one pass.' }
  ]},
  { path: '04_soil_moisture_downscaling.js', label: 'Lesson 4 · Soil-moisture downscaling', steps: [
    { t: 'Goal and idea', d: 'SMAP measures soil moisture at 9 km. Train a model where both sides are coarse, then apply it to fine predictors to get 1 km soil moisture.' },
    { at: 'var basin = ee.FeatureCollection', t: 'Study area and period', d: 'The Lake Urmia basin, spring 2023.' },
    { at: '// ---- Target', t: 'Target: SMAP', d: 'Mean morning soil moisture from the enhanced SMAP L3 product.' },
    { at: '// ---- Predictors', t: 'Predictors from five sensors', d: 'Vegetation (NDVI, EVI), day and night land-surface temperature, Gao NDWI, elevation, slope and Sentinel-1 VV backscatter, stacked into one image.' },
    { at: '// ---- Training at the SMAP scale', t: 'Sampling at 9 km', d: 'Sampling at 9000 m makes Earth Engine average the fine predictors to the SMAP footprint, so inputs and target describe the same area. A random 70/30 split separates training and test points.' },
    { at: '// ---- Hold-out check', t: 'Validation', d: 'R² from Pearson’s correlation and RMSE on the test set, plus a scatter plot. Test R² is about 0.75.' },
    { at: '// ---- Prediction at 1 km', t: 'Prediction at 1 km', d: 'The model is applied to the 1 km predictor stack and compared with the original SMAP map.' }
  ]},
  { path: '05_water_area_timeseries.js', label: 'Lesson 5 · Water-area time series', steps: [
    { t: 'Goal', d: 'Track open-water area every 8 days since 2000 and fit a trend.' },
    { at: '// Water = MNDWI', t: 'Area per image', d: 'Two bands are summed at once: water area and all clear area. The clear fraction lets cloudy dates be dropped later.' },
    { at: 'var series = ee.ImageCollection', t: 'Time series', d: 'Mapping the function over MOD09A1 gives one feature per date; dates with less than 90 % clear area are removed.' },
    { at: 'print(ui.Chart', t: 'Chart with trendline', d: 'Google Charts can draw a linear trend line and its R² directly.' },
    { at: '// Linear trend', t: 'Trend in km² per year', d: '<code>ee.Reducer.linearFit()</code> on decimal year vs. area gives the slope.' }
  ]},
  { path: '06_precipitation_trend.js', label: 'Lesson 6 · Rainfall trends', steps: [
    { t: 'Goal', d: 'Where is rainfall changing? Pixel-wise trend of annual CHIRPS precipitation since 1981.' },
    { at: '// One image per year', t: 'Annual totals with a year band', d: 'Each image holds a constant <code>year</code> band and the annual total, the layout that two-input reducers expect.' },
    { at: "// Sen's slope", t: 'Sen’s slope', d: 'The median of all pairwise slopes, robust to outliers and common in hydrology.' },
    { at: '// Mann-Kendall', t: 'Mann-Kendall significance', d: 'Kendall’s tau between time and rainfall, converted to a z-score with the normal approximation; |z| > 1.96 is significant at 5 %.' },
    { at: 'var mean = annual', t: 'Maps', d: 'Mean annual rainfall, Sen’s slope and a significance overlay.' },
    { at: '// Country-wide annual series', t: 'National series', d: 'The country mean for each year, charted with a trend line.' }
  ]}
  ]
},
{
  id: 'gee-no2-station-tracker',
  title: 'NO₂ Tracking at Air-Quality Stations',
  kicker: 'Earth Engine · Atmosphere',
  cat: ['air'],
  lang: 'js',
  short: 'Daily or monthly tropospheric NO₂ from Sentinel-5P TROPOMI at many monitoring stations, with a multi-station chart, a mean NO₂ map and a tidy CSV export.',
  tags: ['Sentinel-5P', 'Air quality', 'Time series'],
  highlights: [['Daily / monthly', 'aggregation'], ['2 km', 'station buffer'], ['OFFL / NRTI', 'product choice'], ['Any number', 'of stations']],
  caption: 'Example station in Queens, New York: mean 2024 NO₂ field and the monthly series with a 12-month running mean.',
  problem: 'Satellite NO₂ is a valuable complement to ground monitors, but TROPOMI has several overpasses per day with gaps. Station-based studies need a clean daily or monthly series at many points at once.',
  approach: [
    'Read stations from a list or an asset and buffer them.',
    'Aggregate all overpasses into one mean image per day or month, skipping empty steps.',
    'Chart every station together and map the period-mean NO₂ field.',
    'Export one row per station and time step.'
  ],
  skills: ['Sentinel-5P TROPOMI', 'Temporal aggregation', 'Point extraction', 'Multi-station charts', 'Tidy exports'],
  data: [['Sentinel-5P OFFL L3 NO₂', 'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S5P_OFFL_L3_NO2']],
  outputs: ['Multi-station chart', 'Mean NO₂ map', 'CSV: station, date, NO₂, overpasses'],
  files: [{ path: 'no2_station_tracker.js', steps: [
    { t: 'Header and settings', d: 'Stations, period, product (offline archive for trends or near-real-time for the latest days), daily or monthly steps and the buffer radius.' },
    { at: 'var BAND =', t: 'Stations', d: 'Stations come from the inline list or from a point asset with a name field. A buffer averages a few TROPOMI pixels, which reduces noise.' },
    { at: '// ---- NO2 collection', t: 'From overpasses to a clean series', d: 'For each day or month the overpasses are averaged; empty steps get a masked placeholder and are filtered out with the stored image count. Units are converted to µmol/m².' },
    { at: '// ---- Chart', t: 'All stations in one chart', d: '<code>ui.Chart.image.seriesByRegion</code> draws one line per station.' },
    { at: '// ---- Map', t: 'Mean NO₂ field', d: 'The period mean shows where the pollution plume sits relative to the stations.' },
    { at: '// ---- Export a tidy table', t: 'Tidy export', d: 'One row per station and time step, with the number of overpasses behind each value.' }
  ]}]
},
{
  id: 'gee-cropland-dynamics',
  title: 'Global Cropland Dynamics, 2003–2019',
  kicker: 'Earth Engine · Land cover',
  cat: ['land'],
  lang: 'js',
  short: 'Maps stable cropland, gains and losses at 30 m from the GLAD global cropland maps, reports the area of each class and exports GeoTIFFs.',
  tags: ['Land-cover change', 'Global', 'GeoTIFF'],
  highlights: [['30 m', 'resolution'], ['+3,023 km²', 'net gain, example region'], ['3', 'change classes'], ['2', 'GeoTIFF formats']],
  caption: 'North-west Iran: stable cropland, gains and losses between 2003 and 2019, with the area of each class.',
  problem: 'Agricultural expansion drives water demand. Planners need to know where cropland appeared or disappeared, and how much, at field scale.',
  approach: [
    'Mosaic the GLAD 2003 and 2019 cropland tiles that touch the region and make non-cropland explicit.',
    'Combine the two binary maps into stable, gain and loss classes.',
    'Sum pixel areas per class and export a three-band stack and a class map.'
  ],
  skills: ['Change detection', 'Boolean raster algebra', 'Area statistics', 'Map legends', 'GeoTIFF exports'],
  data: [['GLAD Global cropland 2003/2019 (Potapov et al., 2022)', 'https://glad.umd.edu/dataset/croplands']],
  outputs: ['Change map with legend', 'Area per class (km²)', 'GeoTIFF stack and class map'],
  files: [{ path: 'cropland_dynamics.js', steps: [
    { t: 'Header and settings', d: 'Region, exports and the native 30 m scale.' },
    { at: '// ---- Inputs', t: 'Inputs', d: '<code>unmask(0)</code> makes “not cropland” an explicit 0 rather than a masked pixel, so gain/loss logic is evaluated everywhere. <code>filterBounds</code> keeps only tiles that touch the region, which avoids memory errors.' },
    { at: '// ---- Change classes', t: 'Change classes', d: 'Stable = both years, gain = only 2019, loss = only 2003, as a three-band stack and a single class band.' },
    { at: '// ---- Map', t: 'Map and legend', d: 'A legend panel built with <code>ui.Panel</code>.' },
    { at: '// ---- Area statistics', t: 'Area statistics', d: 'Multiplying each class by pixel area and summing gives km² per class in one reduction.' },
    { at: '// ---- Exports', t: 'Exports', d: 'A three-band binary stack and a single class map at 30 m.' }
  ]}]
},
{
  id: 'gee-station-temperature-timeseries',
  title: 'Daily Temperature at Multiple Stations',
  kicker: 'Earth Engine · Climate',
  cat: ['climate'],
  lang: 'js',
  short: 'Daily mean, minimum and maximum 2 m temperature from ERA5-Land at any number of stations, exported as one tidy CSV in °C.',
  tags: ['ERA5-Land', 'Climate', 'Time series'],
  highlights: [['3', 'daily statistics'], ['0.1°', 'ERA5-Land grid'], ['32 yr', 'example record'], ['°C', 'ready to use']],
  caption: 'Daily mean with the min–max range at an example station over the last two years.',
  problem: 'Hydrological and agricultural models need long, gap-free daily temperature at the locations of gauges or fields, often where station records are incomplete.',
  approach: [
    'Read stations from a list or an asset.',
    'Select the daily statistics from ERA5-Land and convert Kelvin to °C.',
    'Sample every day at every station in long format and export one CSV.'
  ],
  skills: ['ERA5-Land reanalysis', 'Multi-band sampling', 'Long-format tables', 'Chart limits'],
  data: [['ERA5-Land daily aggregates', 'https://developers.google.com/earth-engine/datasets/catalog/ECMWF_ERA5_LAND_DAILY_AGGR']],
  outputs: ['Chart for the first station', 'CSV: station, date, mean/min/max °C'],
  files: [{ path: 'station_temperature_timeseries.js', steps: [
    { t: 'Header and settings', d: 'Stations, period and a mapping from output column names to ERA5-Land bands, so other variables can be added.' },
    { at: 'var SCALE =', t: 'Stations', d: 'Inline stations or an asset with an ID field.' },
    { at: '// ---- Daily ERA5-Land', t: 'Kelvin to Celsius', d: 'Bands are renamed to the output names and converted while keeping the date.' },
    { at: '// ---- Sample every day', t: 'Long-format sampling', d: '<code>reduceRegions</code> with <code>first()</code> on a multi-band image returns one property per band, so mean, min and max come out together.' },
    { at: '// ---- Quick look', t: 'A quick chart', d: 'Charts are limited to 5000 points, so only the last two years are drawn.' },
    { at: '// ---- Export', t: 'Export', d: 'One CSV with station, date and the temperature columns.' }
  ]}]
},
{
  id: 'gee-elevation-cross-section',
  title: 'Elevation Along a Cross-Section',
  kicker: 'Earth Engine · Terrain',
  cat: ['land'],
  lang: 'js',
  short: 'Samples SRTM or Copernicus DEM every n metres along any line or polyline, charts the terrain profile and exports it as CSV.',
  tags: ['SRTM', 'Copernicus DEM', 'Terrain profile'],
  highlights: [['≈109 km', 'example line'], ['436', 'samples'], ['3', 'DEMs to choose'], ['250 m', 'spacing']],
  caption: 'An example polyline over SRTM 30 m and its elevation profile, with the highest point at 2,039 m.',
  problem: 'Cross-sections are needed for dam sites, groundwater models and channel design. Sampling a DEM at even geodesic spacing along a bent line is not built into Earth Engine.',
  approach: [
    'Choose a DEM (SRTM 30/90 m or Copernicus GLO-30).',
    'Cut the line at every n metres with <code>cutLines</code> and take the start of each piece as a sample point.',
    'Sample elevations, chart the profile and export distance, lon, lat and elevation.'
  ],
  skills: ['Geodesic geometry', 'DEM handling', 'Profile charts', 'Server-side lists'],
  data: [['SRTM 30 m', 'https://developers.google.com/earth-engine/datasets/catalog/USGS_SRTMGL1_003'], ['Copernicus GLO-30', 'https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_DEM_GLO30']],
  outputs: ['Elevation profile chart', 'Hillshade map', 'CSV: distance, lon, lat, elevation'],
  files: [{ path: 'elevation_cross_section.js', steps: [
    { t: 'Header and settings', d: 'A line (or a drawn geometry), the spacing and the DEM.' },
    { at: 'var line =', t: 'Choose a DEM', d: 'Copernicus GLO-30 is a tiled collection; after <code>mosaic()</code> its projection is restored so the hillshade works.' },
    { at: '// ---- Points every', t: 'Even spacing along a bent line', d: '<code>cutLines</code> splits the line at multiples of the spacing; the first vertex of piece <em>i</em> lies at distance <em>i</em> × spacing. The end point is added so the profile reaches the full length.' },
    { at: '// ---- Sample the DEM', t: 'Sample', d: 'One <code>reduceRegions</code> call reads the DEM at every point; coordinates are stored for the export.' },
    { at: '// ---- Chart', t: 'Profile chart', d: 'An area chart of elevation against distance.' },
    { at: '// ---- Map', t: 'Map and export', d: 'Hillshade, the line and the sample points, and a CSV export.' }
  ]}]
},
{
  id: 'era5-pressure-level-downloader',
  title: 'ERA5 Pressure-Level Downloads via CDS API',
  kicker: 'Python · Command-line tool',
  cat: ['climate', 'python'],
  lang: 'py',
  short: 'Command-line tool for ERA5 monthly-mean humidity, winds and other pressure-level variables from the Climate Data Store, with config files, sub-regions and resumable downloads.',
  tags: ['ERA5', 'CDS API', 'NetCDF'],
  highlights: [['CLI', 'argparse + TOML/JSON'], ['Resumable', 'skips finished files'], ['Retries', 'with back-off'], ['--dry-run', 'see requests first']],
  problem: 'Large ERA5 requests time out or wait for hours in the CDS queue, and an interrupted download starts from zero. Researchers also copy request dictionaries between notebooks and lose track of what they downloaded.',
  approach: [
    'Read options from defaults, a TOML/JSON config file and the command line, in that order of priority, and validate them.',
    'Split the request into one job per year and pressure level (or per year, or none).',
    'Download each job to a temporary <code>.part</code> file and rename it when complete, so finished files are skipped on the next run.',
    'Retry failed requests with increasing waits.'
  ],
  skills: ['Python packaging & CLI design', 'argparse', 'Config files (TOML/JSON)', 'Input validation', 'Robust downloads', 'Logging', 'Climate reanalysis'],
  data: [['ERA5 monthly means on pressure levels', 'https://cds.climate.copernicus.eu/datasets/reanalysis-era5-pressure-levels-monthly-means']],
  outputs: ['NetCDF files, one per year and level'],
  install: 'git clone https://github.com/RisaRezaei/era5-pressure-level-downloader.git\ncd era5-pressure-level-downloader\npip install -r requirements.txt',
  demo: { title: 'Real dry run (no download)', cmd: 'python era5_download.py --years 2023 --levels 850 500 --area 45 40 25 65 --dry-run',
    out: 'INFO 2 request(s) planned -> data/era5\n# data/era5/ERA5_monthly_2023_850hPa.nc\n{\n  "dataset": "reanalysis-era5-pressure-levels-monthly-means",\n  "request": {\n    "product_type": ["monthly_averaged_reanalysis"],\n    "variable": ["specific_humidity", "u_component_of_wind", "v_component_of_wind"],\n    "pressure_level": ["850"],\n    "year": ["2023"],\n    "month": ["01", "02", "03", "04", "11", "12"],\n    "time": ["00:00"],\n    "data_format": "netcdf",\n    "download_format": "unarchived",\n    "area": [45.0, 40.0, 25.0, 65.0]\n  }\n}\n# data/era5/ERA5_monthly_2023_500hPa.nc\n{ … same request for 500 hPa … }' },
  files: [{ path: 'era5_download.py', steps: [
    { t: 'Module docstring and constants', d: 'The docstring doubles as usage help. Valid pressure levels are listed so bad input fails early with a clear message instead of a CDS error after queueing.' },
    { at: '# Argument handling', t: 'Years and config files', d: '<code>parse_years</code> accepts single years and ranges such as <code>2010-2015</code>. <code>load_config</code> reads TOML (standard library from Python 3.11) or JSON.' },
    { at: 'def build_parser', t: 'The command-line interface', d: 'Every option has help text and the defaults are printed by <code>ArgumentDefaultsHelpFormatter</code>.' },
    { at: 'DEFAULTS = {', t: 'Defaults < config < command line', d: '<code>resolve_options</code> merges the three layers and validates months, levels, product and area, raising <code>SystemExit</code> with a readable message.' },
    { at: '# Requests', t: 'Building and splitting requests', d: '<code>make_request</code> writes the CDS request dictionary. <code>plan_jobs</code> splits the work into (target file, request) pairs; small jobs move through the CDS queue faster.' },
    { at: 'def download(', t: 'Resumable downloads with retries', d: 'Existing files are skipped. Each job downloads to a <code>.part</code> file that is renamed only on success, so a crash never leaves a half file that looks complete. Failed requests are retried after 30 s, then 60 s, and so on.' },
    { at: 'def main(', t: 'Entry point', d: '<code>--dry-run</code> prints every request as JSON without contacting the CDS. The exit code is non-zero if any request failed, so the tool can be used in scripts and schedulers.' }
  ]}]
},
{
  id: 'raster-point-sampler',
  title: 'Raster Values at Point Locations',
  kicker: 'Python · Command-line tool',
  cat: ['land', 'python'],
  lang: 'py',
  short: 'Command-line tool that samples a stack of rasters at points, with automatic reprojection and nodata handling, into one Excel, CSV or GeoPackage table.',
  tags: ['rasterio', 'GeoPandas', 'Excel / CSV'],
  highlights: [['Any', 'GDAL raster format'], ['Auto', 'reprojection'], ['NaN', 'for nodata & outside'], ['4', 'output formats']],
  problem: 'Extracting values from dozens of rasters (daily climate grids, flood maps, model outputs) at gauges or field points is a daily task that is often done by hand in GIS, raster by raster.',
  approach: [
    'Read points from a vector file or a CSV with coordinates.',
    'For each raster, reproject the points to the raster’s CRS and sample all requested bands.',
    'Turn nodata and points outside the raster into empty cells instead of junk values.',
    'Name columns from file names (optionally with a regex such as a date) and write Excel, CSV, GeoPackage or GeoJSON.'
  ],
  skills: ['rasterio', 'GeoPandas', 'Coordinate reference systems', 'Nodata handling', 'NumPy', 'CLI design', 'Excel / GIS outputs'],
  data: [['Any GDAL-readable raster (GeoTIFF, NetCDF, …)', 'https://gdal.org/drivers/raster/']],
  outputs: ['One table: one row per point, one column per raster and band'],
  install: 'git clone https://github.com/RisaRezaei/raster-point-sampler.git\ncd raster-point-sampler\npip install -r requirements.txt',
  demo: { title: 'Real run on four test rasters', cmd: 'python sample_rasters.py --points stations.csv --rasters "maps/*.tif" --name-regex "(\\d{8})" --out samples.csv',
    out: 'INFO 5 points, 4 rasters\nINFO [1/4] t2m_20230115.tif\nINFO [2/4] t2m_20230415.tif\nINFO [3/4] t2m_20230715.tif\nINFO [4/4] t2m_20231015.tif\nINFO wrote samples.csv (5 rows x 4 raster columns, 4 empty cells)',
    table: [['station', '20230115', '20230415', '20230715', '20231015'], ['Tabriz', '4.37', '15.28', '27.03', '14.46'], ['Urmia', '1.68', '11.53', '26.10', '13.15'], ['Maragheh', '2.48', '11.42', '25.17', '13.55'], ['Mahabad', '1.52', '9.00', '21.64', '12.47'], ['Outside_extent', '', '', '', '']],
    note: 'Synthetic test rasters; the last point lies outside them, so its cells stay empty instead of holding 0 or −9999.' },
  files: [{ path: 'sample_rasters.py', steps: [
    { t: 'Docstring and imports', d: 'Usage examples in the docstring; rasterio for rasters, GeoPandas for points.' },
    { at: 'def read_points', t: 'Reading points', d: 'CSV files become points from two columns; vector files are read directly. Missing CRS and non-point geometries are handled with a warning instead of a crash.' },
    { at: 'def column_name', t: 'Column names from file names', d: 'A regex such as <code>(\\d{8})</code> turns <code>t2m_20230715.tif</code> into a column called <code>20230715</code>.' },
    { at: 'def sample_raster', t: 'Sampling one raster correctly', d: 'Points are reprojected to the raster CRS, all bands are read at once with <code>src.sample</code>, nodata values become NaN, and points outside the raster bounds are blanked (rasterio would otherwise return 0).' },
    { at: 'def write_table', t: 'Output formats', d: 'Excel, CSV or a GIS format, chosen from the file extension.' },
    { at: 'def main(', t: 'Command line and assembly', d: 'Glob patterns are expanded, duplicate column names get a suffix, WGS84 coordinates are added for spreadsheets, and a summary reports the number of empty cells.' }
  ]}]
}
];
window.TOOL_CATS = [['all', 'All'], ['water', 'Water'], ['air', 'Air quality'], ['climate', 'Climate'], ['land', 'Land & terrain'], ['ml', 'Machine learning'], ['teaching', 'Teaching'], ['python', 'Python']];
