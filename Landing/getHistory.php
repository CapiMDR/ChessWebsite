<?php
session_start();

//TODO: Database query with logged user
$history = [
    [
        'id' => 1,
        'date' => '2025-10-30 18:12',
        'opponent' => 'opponent1',
        'color' => 'White',
        'result' => 'Win',
        'pgn' => "1-d2d4 g8f6
                2-c1f4 b8c6
                3-e2e3 f6d5
                4-f4g3 e7e6
                5-b1d2 d5f6
                6-g1f3 d7d5
                7-f1b5 c8d7
                8-e1g1 f8d6
                9-g3d6 c7d6
                10-d1e2 d8b6
                11-a2a3 a7a6
                12-b5c6 d7c6
                13-e2d3 e8g8
                14-a1b1 a8e8
                15-d3c3 f6e4
                16-c3d3 e6e5
                17-h2h3 e4f6
                18-d3b3 b6a5
                19-b1d1 e5e4
                20-f3h4 c6a4
                21-b3b7 a4c2
                22-h4f5 c2d1
                23-f1d1 e8b8
                24-b7c6 b8b2
                25-f5e7 g8h8
                26-c6d6 b2d2
                27-d1d2 a5d2
                28-e7d5 d2d1
                29-g1h2 f8a8
                30-d5f6 g7f6
                31-d6f6 h8g8
                32-f6g5 g8f8
                33-g5c5 f8g7
                34-c5g5 g7h8
                35-g5f6 h8g8
                36-f6g5 g8f8
                37-g5c5 f8g8
                38-c5g5"
    ],
    [
        'id' => 2,
        'date' => '2025-10-29 20:05',
        'opponent' => 'opponent2',
        'color' => 'Black',
        'result' => 'Loss',
        'pgn' => "1-e2e4 c7c6
                2-d2d4 d7d6
                3-b1c3 d8c7
                4-g1f3 b8d7
                5-c1e3 g8f6
                6-f1d3 e7e5
                7-e1g1 f8e7
                8-f1e1 e8g8
                9-h2h3 d6d5
                10-e4d5 f6d5
                11-c3d5 c6d5
                12-d4e5 d7e5
                13-f3e5 c7e5
                14-e3a7 e5b2
                15-a7e3 a8a2
                16-a1a2 b2a2
                17-d1h5 g7g6
                18-h5e5 a2a5
                19-e3h6 a5e1
                20-e5e1 e7f6
                21-h6f8 g8f8
                22-e1a5 c8e6
                23-a5a8 f8g7
                24-a8b7 h7h5
                25-f2f3 f6d4
                26-g1f1 g7f6
                27-b7a6 d4e5
                28-d3b5 h5h4
                29-b5d7 g6g5
                30-d7e6 f7e6
                31-f1e2 f6f5
                32-e2d3 e5g7
                33-a6c6 g7e5
                34-c6e8 e5f6
                35-d3e3 f6e5
                36-e8c6 e5f6
                37-c2c4 d5d4
                38-e3d3 e6e5
                39-c6e4 f5e6
                40-c4c5 e6e7
                41-c5c6 e7d6
                42-d3c4 d6c7
                43-c4b5 f6g7
                44-e4h7 c7d6
                45-h7g7 d6e6
                46-g7g5 d4d3
                47-g5h4 e6f7
                48-h4h6 d3d2
                49-h6d2 f7g6
                50-c6c7 e5e4
                51-c7c8q e4e3
                52-d2d3 g6g7
                53-c8d7 g7f8
                54-d3f5 f8g8
                55-d7f7 g8h8
                56-f5h7"
    ],
    [
        'id' => 3,
        'date' => '2025-09-10 15:20',
        'opponent' => 'capraStar',
        'color' => 'White',
        'result' => 'Draw',
        'pgn' => "1-d2d4 g8f6
                2-g1f3 e7e6
                3-e2e3 b7b6
                4-f1d3 c8b7
                5-b1d2 f8e7
                6-d1e2 b8c6
                7-c2c3 d7d5
                8-e1g1 e8g8
                9-e3e4 d5e4
                10-d2e4 d8d5
                11-f1e1 f6e4
                12-d3e4 d5d6
                13-g2g3 a8b8
                14-c1f4 d6d7
                15-a2a4 e7d6
                16-e2e3 h7h6
                17-a1d1 b8d8
                18-f3e5 d6e5
                19-d4e5 d7d1
                20-e1d1 d8d1
                21-g1g2 c6a5
                22-e4b7 a5b7
                23-e3f3 d1b1
                24-f3b7 g7g5
                25-f4e3 b1b2
                26-b7c7 f8a8
                27-e3d4 b2a2
                28-c7d7 g5g4
                29-d4e3 h6h5
                30-d7e7 a2a4
                31-e7g5 g8f8
                32-g5h5 f8g8
                33-e3g5 a4f4
                34-g5f4 a8b8
                35-h5g5 g8f8
                36-g5g4 a7a5
                37-g4h5 f8g8
                38-f4h6 g8h7
                39-h6g5 h7g8
                40-g5f6 b8e8
                41-h5h8"
    ]
];

//Return history
echo json_encode(['user' => $_SESSION['user'], 'history' => $history]);
