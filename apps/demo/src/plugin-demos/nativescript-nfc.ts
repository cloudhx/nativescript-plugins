import { Dialogs, EventData, Page } from '@nativescript/core';
import { DemoSharedNativescriptNfc } from '@demo/shared';
import { Nfc, NfcNdefData, NfcTagData } from '@nordsense/nativescript-nfc';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new DemoModel();
}

export class DemoModel extends DemoSharedNativescriptNfc {
  public lastNdefDiscovered: string = 'Press a button...';
  private nfc: Nfc;

  constructor() {
    super();
    this.nfc = new Nfc();
  }

  public doCheckAvailable() {
    this.nfc.available().then(
      (avail) => {
        console.log('Available? ' + avail);
        Dialogs.alert('' + avail);
      },
      (err) => {
        alert(err);
      }
    );
  }

  public doCheckEnabled() {
    this.nfc.enabled().then(
      (on) => {
        console.log('Enabled? ' + on);
        Dialogs.alert('' + on);
      },
      (err) => {
        alert(err);
      }
    );
  }

  public doStartTagListener() {
    this.nfc
      .setOnTagDiscoveredListener((data: NfcTagData) => {
        console.log('Tag discovered! ' + data.id);
        this.set('lastTagDiscovered', data.id);
      })
      .then(
        () => {
          console.log('OnTagDiscovered Listener set');
        },
        (err) => {
          console.log(err);
        }
      );
  }

  public doStopTagListener() {
    this.nfc.setOnTagDiscoveredListener(null).then(
      () => {
        console.log('OnTagDiscovered nulled');
      },
      (err) => {
        console.log(err);
      }
    );
  }

  public doStartNdefListener() {
    this.nfc
      .setOnNdefDiscoveredListener(
        (data: NfcNdefData) => {
          if (data.message) {
            let tagMessages = [];
            // data.message is an array of records, so:
            data.message.forEach((record) => {
              console.log('Read record: ' + JSON.stringify(record));
	      alert("Read record: " + JSON.stringify(record));
              tagMessages.push(record.payloadAsString);
            });
            this.set('lastNdefDiscovered', 'Read: ' + tagMessages.join(', '));
          }
        },
        {
          stopAfterFirstRead: true,
          startMessage: 'Scan a tag, baby!',
        }
      )
      .then(() => this.set('lastNdefDiscovered', 'Listening...'))
      .catch((err) => alert(err));
  }

  public doStopNdefListener() {
    this.nfc.setOnNdefDiscoveredListener(null).then(
      () => {
        this.set('lastNdefDiscovered', 'Stopped listening.');
      },
      (err) => {
        alert(err);
      }
    );
  }

  public async doWriteText() {
    try {
      const data = await this.nfc.writeTag({
        textRecords: [
          {
            id: [1],
            text: 'Hello!!!!!',
          },
        ],
        startMessage: "Approach an NFC Tag",
        endMessage: "Done!",
        writeGuardBeforeCheckErrorMessage: "Write guard (before) says No!",
        writeGuardAfterCheckDelay: 5000,
        writeGuardAfterCheckErrorMessage: "Write guard (after) says No!",
        writeGuardAfterCheckMessage: "Almost done, please do not remove the tag!"
      }, (data) => {
        return true;
      }, (data) => {
        return true;
      });
      alert(JSON.stringify(data));
    } catch (e) {
      if (e.name === "WriteGuardBeforeCheckError") {
        console.log("WriteGuardBeforeCheckError.data", JSON.stringify(e.data));
      } else if (e.name === "WriteGuardAfterCheckError") {
        console.log("WriteGuardAfterCheckError.data", JSON.stringify(e.data));
      }
      alert(e.message || e);
    }
  }

  public doWriteUri() {
    this.nfc
      .writeTag({
        uriRecords: [
          {
            id: [2, 5],
            uri: 'https://www.telerik.com',
          },
        ],
      })
      .then(
        () => {
          this.set('lastNdefDiscovered', "Wrote uri 'https://www.telerik.com");
        },
        (err) => {
          console.log(err);
        }
      );
  }

  public doEraseTag() {
    this.nfc.eraseTag().then(
      () => {
        this.set('lastNdefDiscovered', 'Tag erased');
      },
      (err) => {
        console.log(err);
      }
    );
  }
}

