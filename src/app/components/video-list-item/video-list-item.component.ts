import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-video-list-item',
  templateUrl: './video-list-item.component.html',
  styleUrls: ['./video-list-item.component.scss']
})
export class VideoListItemComponent implements OnInit, OnDestroy {

  @Input() videoInfo;
  @Output() hideCard = new EventEmitter();
  hasDownloadStarted = false;
  percentDownloaded = 0;
  downloadStarted = false;
  videoLength = '';
  downloaded = false;
  chosenFormat = '.mp4';

  constructor (private electronService: ElectronService,
               private changeDetectorRef: ChangeDetectorRef,
               private helperService: HelperService) {
  }

  ngOnInit () {
    console.log(this.videoInfo);
    this.videoLength = this.helperService.toHHMMSS(this.videoInfo.length_seconds);
  }

  ngOnDestroy () {
    console.log('destroy');
    this.electronService.ipcRenderer.removeAllListeners(`video:download_success_${this.videoInfo.eventid}`);
    this.electronService.ipcRenderer.removeAllListeners(`video:download_progress_${this.videoInfo.eventid}`);
    this.electronService.ipcRenderer.removeAllListeners(`video:download_start_${this.videoInfo.eventid}`);
  }


  openChannelInBrowser () {
    this.electronService.shell.openExternal(this.videoInfo.author.channel_url);
  }

  openVideoInBrowser () {
    this.electronService.shell.openExternal(this.videoInfo.video_url);
  }

  outputDownloadVideoEvent () {
    this.electronService.ipcRenderer.send('video:download_single', this.videoInfo, this.chosenFormat);
    this.electronService.ipcRenderer
      .on(`video:download_success_${this.videoInfo.eventid}`, this.videoDownloadSuccessHandler.bind(this));
    this.electronService.ipcRenderer
      .on(`video:download_progress_${this.videoInfo.eventid}`, this.videoDownloadProgressHandler.bind(this));
    this.electronService.ipcRenderer
      .on(`video:download_start_${this.videoInfo.eventid}`, this.videoDownloadStartHandler.bind(this));
  }

  videoDownloadSuccessHandler (event, data) {
    this.downloaded = true;
    this.changeDetectorRef.detectChanges();
  }

  videoDownloadProgressHandler (event, data) {
    this.downloadStarted = true;
    this.percentDownloaded = data.percentDownloaded;
    this.changeDetectorRef.detectChanges();
  }

  videoDownloadStartHandler (event, data) {
    this.hasDownloadStarted = true;
    this.changeDetectorRef.detectChanges();
  }

  sendHideCardEvent () {
    this.hideCard.emit(this.videoInfo);
  }

}
